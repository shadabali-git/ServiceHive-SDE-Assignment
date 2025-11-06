import express from "express"
import { v4 as uuidv4 } from "uuid"
import { authenticateToken } from "../middleware/auth.js"
import { runQuery, getQuery, allQuery } from "../database/init.js"

const router = express.Router()

// Get user's events
router.get("/", authenticateToken, async (req, res) => {
  try {
    const events = await allQuery("SELECT * FROM events WHERE user_id = ? ORDER BY start_time", [req.user.userId])
    res.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    res.status(500).json({ error: "Failed to fetch events" })
  }
})

// Create event
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, startTime, endTime } = req.body

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const eventId = uuidv4()
    await runQuery("INSERT INTO events (id, user_id, title, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)", [
      eventId,
      req.user.userId,
      title,
      startTime,
      endTime,
      "BUSY",
    ])

    const event = await getQuery("SELECT * FROM events WHERE id = ?", [eventId])
    res.status(201).json(event)
  } catch (error) {
    console.error("Error creating event:", error)
    res.status(500).json({ error: "Failed to create event" })
  }
})

// Update event status
router.patch("/:eventId", authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params
    const { status } = req.body

    if (!["BUSY", "SWAPPABLE", "SWAP_PENDING"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    const event = await getQuery("SELECT * FROM events WHERE id = ?", [eventId])
    if (!event || event.user_id !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    await runQuery("UPDATE events SET status = ? WHERE id = ?", [status, eventId])
    const updatedEvent = await getQuery("SELECT * FROM events WHERE id = ?", [eventId])
    res.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    res.status(500).json({ error: "Failed to update event" })
  }
})

// Delete event
router.delete("/:eventId", authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params

    const event = await getQuery("SELECT * FROM events WHERE id = ?", [eventId])
    if (!event || event.user_id !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    await runQuery("DELETE FROM events WHERE id = ?", [eventId])
    res.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    res.status(500).json({ error: "Failed to delete event" })
  }
})

export default router
