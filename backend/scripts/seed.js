import sqlite3 from "sqlite3"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, "../slotswapper.db")

const db = new sqlite3.Database(DB_PATH)

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

async function seed() {
  try {
    console.log("🌱 Starting database seeding...")

    // Create test users
    const user1Id = uuidv4()
    const user2Id = uuidv4()
    const user3Id = uuidv4()

    const hashedPassword = await bcrypt.hash("password123", 10)

    await run("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)", [
      user1Id,
      "Alice Johnson",
      "alice@example.com",
      hashedPassword,
    ])
    console.log("✓ Created user: alice@example.com")

    await run("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)", [
      user2Id,
      "Bob Smith",
      "bob@example.com",
      hashedPassword,
    ])
    console.log("✓ Created user: bob@example.com")

    await run("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)", [
      user3Id,
      "Carol White",
      "carol@example.com",
      hashedPassword,
    ])
    console.log("✓ Created user: carol@example.com")

    // Create test events for Alice
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Alice's events
    await run("INSERT INTO events (id, user_id, title, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)", [
      uuidv4(),
      user1Id,
      "Team Meeting",
      tomorrow.toISOString(),
      new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
      "SWAPPABLE",
    ])
    console.log("✓ Created swappable event for Alice")

    await run("INSERT INTO events (id, user_id, title, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)", [
      uuidv4(),
      user1Id,
      "Client Call",
      nextWeek.toISOString(),
      new Date(nextWeek.getTime() + 30 * 60 * 1000).toISOString(),
      "BUSY",
    ])
    console.log("✓ Created busy event for Alice")

    // Bob's events
    await run("INSERT INTO events (id, user_id, title, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)", [
      uuidv4(),
      user2Id,
      "Focus Block",
      new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      "SWAPPABLE",
    ])
    console.log("✓ Created swappable event for Bob")

    await run("INSERT INTO events (id, user_id, title, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)", [
      uuidv4(),
      user2Id,
      "Lunch Meeting",
      new Date(nextWeek.getTime() + 12 * 60 * 60 * 1000).toISOString(),
      new Date(nextWeek.getTime() + 13 * 60 * 60 * 1000).toISOString(),
      "BUSY",
    ])
    console.log("✓ Created busy event for Bob")

    // Carol's events
    await run("INSERT INTO events (id, user_id, title, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)", [
      uuidv4(),
      user3Id,
      "Project Review",
      new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      new Date(tomorrow.getTime() + 5 * 60 * 60 * 1000).toISOString(),
      "SWAPPABLE",
    ])
    console.log("✓ Created swappable event for Carol")

    console.log("\n✅ Database seeded successfully!")
    console.log("\nTest credentials:")
    console.log("Email: alice@example.com")
    console.log("Email: bob@example.com")
    console.log("Email: carol@example.com")
    console.log("Password: password123 (for all users)")

    process.exit(0)
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  }
}

seed()
