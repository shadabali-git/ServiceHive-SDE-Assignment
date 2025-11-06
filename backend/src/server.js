import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { initializeDatabase } from "./database/init.js"
import authRoutes from "./routes/auth.js"
import eventsRoutes from "./routes/events.js"
import swapRoutes from "./routes/swap.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// Initialize database
await initializeDatabase()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/events", eventsRoutes)
app.use("/api/swap", swapRoutes)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Backend is running" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Internal server error" })
})

app.listen(PORT, () => {
  console.log(`SlotSwapper backend running on port ${PORT}`)
})
