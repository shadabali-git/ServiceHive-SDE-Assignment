import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { runQuery, getQuery } from "../database/init.js"

const router = express.Router()

// Sign up
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    await runQuery("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)", [
      userId,
      name,
      email,
      hashedPassword,
    ])

    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.status(201).json({ token, user: { id: userId, name, email } })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Signup failed" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" })
    }

    const user = await getQuery("SELECT * FROM users WHERE email = ?", [email])
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

export default router
