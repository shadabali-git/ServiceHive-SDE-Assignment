-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Events table
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
);

-- Create Swap Requests table
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
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_swap_requests_requester ON swap_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON swap_requests(status);
