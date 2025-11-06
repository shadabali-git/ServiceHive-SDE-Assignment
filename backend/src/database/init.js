import sqlite3 from "sqlite3"
import { promisify } from "util"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, "../../slotswapper.db")

let db

export function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH)
  }
  return db
}

export async function initializeDatabase() {
  const database = getDatabase()
  const run = promisify(database.run.bind(database))

  try {
    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Events table
    await run(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        status TEXT DEFAULT 'BUSY',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CHECK(status IN ('BUSY', 'SWAPPABLE', 'SWAP_PENDING'))
      )
    `)

    // Swap Requests table
    await run(`
      CREATE TABLE IF NOT EXISTS swap_requests (
        id TEXT PRIMARY KEY,
        requester_id TEXT NOT NULL,
        requester_slot_id TEXT NOT NULL,
        target_slot_id TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (requester_slot_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (target_slot_id) REFERENCES events(id) ON DELETE CASCADE,
        CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED'))
      )
    `)

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
    throw error
  }
}

export function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().run(sql, params, function (err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

export function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

export function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDatabase().all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows || [])
    })
  })
}
