import express from "express"
import { v4 as uuidv4 } from "uuid"
import { authenticateToken } from "../middleware/auth.js"
import { runQuery, getQuery, allQuery } from "../database/init.js"

const router = express.Router()

// Get all swappable slots from other users
router.get("/swappable-slots", authenticateToken, async (req, res) => {
  try {
    const slots = await allQuery(
      `SELECT e.*, u.name, u.id as owner_id FROM events e
       JOIN users u ON e.user_id = u.id
       WHERE e.status = 'SWAPPABLE' AND e.user_id != ?
       ORDER BY e.start_time`,
      [req.user.userId],
    )
    res.json(slots)
  } catch (error) {
    console.error("Error fetching swappable slots:", error)
    res.status(500).json({ error: "Failed to fetch swappable slots" })
  }
})

// Request a swap
router.post("/request", authenticateToken, async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body

    if (!mySlotId || !theirSlotId) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Verify both slots exist and are swappable
    const mySlot = await getQuery("SELECT * FROM events WHERE id = ? AND user_id = ?", [mySlotId, req.user.userId])
    const theirSlot = await getQuery("SELECT * FROM events WHERE id = ?", [theirSlotId])

    if (!mySlot || !theirSlot) {
      return res.status(404).json({ error: "Slot not found" })
    }

    if (mySlot.status !== "SWAPPABLE" || theirSlot.status !== "SWAPPABLE") {
      return res.status(400).json({ error: "Slots are not available for swapping" })
    }

    // Create swap request
    const requestId = uuidv4()
    await runQuery(
      `INSERT INTO swap_requests (id, requester_id, requester_slot_id, target_slot_id, status)
       VALUES (?, ?, ?, ?, 'PENDING')`,
      [requestId, req.user.userId, mySlotId, theirSlotId],
    )

    // Update both slots to SWAP_PENDING
    await runQuery("UPDATE events SET status = ? WHERE id = ?", ["SWAP_PENDING", mySlotId])
    await runQuery("UPDATE events SET status = ? WHERE id = ?", ["SWAP_PENDING", theirSlotId])

    const swapRequest = await getQuery("SELECT * FROM swap_requests WHERE id = ?", [requestId])
    res.status(201).json(swapRequest)
  } catch (error) {
    console.error("Error creating swap request:", error)
    res.status(500).json({ error: "Failed to create swap request" })
  }
})

// Get incoming swap requests
router.get("/incoming", authenticateToken, async (req, res) => {
  try {
    const requests = await allQuery(
      `SELECT sr.*, u.name as requester_name, u.email as requester_email,
              e1.title as my_slot_title, e1.start_time as my_slot_start, e1.end_time as my_slot_end,
              e2.title as their_slot_title, e2.start_time as their_slot_start, e2.end_time as their_slot_end
       FROM swap_requests sr
       JOIN users u ON sr.requester_id = u.id
       JOIN events e1 ON sr.requester_slot_id = e1.id
       JOIN events e2 ON sr.target_slot_id = e2.id
       WHERE e2.user_id = ? AND sr.status = 'PENDING'
       ORDER BY sr.created_at DESC`,
      [req.user.userId],
    )
    res.json(requests)
  } catch (error) {
    console.error("Error fetching incoming requests:", error)
    res.status(500).json({ error: "Failed to fetch incoming requests" })
  }
})

// Get outgoing swap requests
router.get("/outgoing", authenticateToken, async (req, res) => {
  try {
    const requests = await allQuery(
      `SELECT sr.*, u.name as target_user_name, u.email as target_user_email,
              e1.title as my_slot_title, e1.start_time as my_slot_start, e1.end_time as my_slot_end,
              e2.title as their_slot_title, e2.start_time as their_slot_start, e2.end_time as their_slot_end
       FROM swap_requests sr
       JOIN users u ON e2.user_id = u.id
       JOIN events e1 ON sr.requester_slot_id = e1.id
       JOIN events e2 ON sr.target_slot_id = e2.id
       WHERE sr.requester_id = ?
       ORDER BY sr.created_at DESC`,
      [req.user.userId],
    )
    res.json(requests)
  } catch (error) {
    console.error("Error fetching outgoing requests:", error)
    res.status(500).json({ error: "Failed to fetch outgoing requests" })
  }
})

// Respond to swap request (accept/reject)
router.post("/response/:requestId", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params
    const { accept } = req.body

    if (typeof accept !== "boolean") {
      return res.status(400).json({ error: "Accept must be a boolean" })
    }

    const swapRequest = await getQuery("SELECT * FROM swap_requests WHERE id = ?", [requestId])
    if (!swapRequest) {
      return res.status(404).json({ error: "Swap request not found" })
    }

    const targetSlot = await getQuery("SELECT * FROM events WHERE id = ?", [swapRequest.target_slot_id])
    if (targetSlot.user_id !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    if (accept) {
      // Accept swap
      const requesterSlot = await getQuery("SELECT * FROM events WHERE id = ?", [swapRequest.requester_slot_id])

      // Exchange ownership
      await runQuery("UPDATE events SET user_id = ?, status = ? WHERE id = ?", [
        req.user.userId,
        "BUSY",
        requesterSlot.id,
      ])
      await runQuery("UPDATE events SET user_id = ?, status = ? WHERE id = ?", [
        swapRequest.requester_id,
        "BUSY",
        targetSlot.id,
      ])

      await runQuery("UPDATE swap_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
        "ACCEPTED",
        requestId,
      ])
    } else {
      // Reject swap
      await runQuery("UPDATE events SET status = ? WHERE id = ?", ["SWAPPABLE", swapRequest.requester_slot_id])
      await runQuery("UPDATE events SET status = ? WHERE id = ?", ["SWAPPABLE", swapRequest.target_slot_id])
      await runQuery("UPDATE swap_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
        "REJECTED",
        requestId,
      ])
    }

    const updatedRequest = await getQuery("SELECT * FROM swap_requests WHERE id = ?", [requestId])
    res.json(updatedRequest)
  } catch (error) {
    console.error("Error responding to swap request:", error)
    res.status(500).json({ error: "Failed to respond to swap request" })
  }
})

export default router
