# Backend Setup Guide

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

## Installation

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create environment file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Update `.env` with your configuration (important: change `JWT_SECRET`):
   \`\`\`
   DATABASE_URL=sqlite:./slotswapper.db
   JWT_SECRET=your_super_secret_key_here
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   \`\`\`

## Database Setup

The database is automatically initialized when the server starts. The first run will create all tables.

To seed the database with test data:

\`\`\`bash
npm run seed
\`\`\`

This will create 3 test users with sample events:
- alice@example.com (password: password123)
- bob@example.com (password: password123)
- carol@example.com (password: password123)

## Running the Server

Development mode (with auto-reload):
\`\`\`bash
npm run dev
\`\`\`

Production mode:
\`\`\`bash
npm start
\`\`\`

The server will start on `http://localhost:5000` by default.

## API Documentation

### Authentication Endpoints

#### Sign Up
\`\`\`
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
\`\`\`

#### Login
\`\`\`
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
\`\`\`

### Event Endpoints

#### Get All User Events
\`\`\`
GET /api/events
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Team Meeting",
    "start_time": "2024-01-15T10:00:00",
    "end_time": "2024-01-15T11:00:00",
    "status": "SWAPPABLE",
    "created_at": "2024-01-14T12:00:00"
  }
]
\`\`\`

#### Create Event
\`\`\`
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "startTime": "2024-01-15T10:00:00",
  "endTime": "2024-01-15T11:00:00"
}

Response:
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Team Meeting",
  "start_time": "2024-01-15T10:00:00",
  "end_time": "2024-01-15T11:00:00",
  "status": "BUSY",
  "created_at": "2024-01-14T12:00:00"
}
\`\`\`

#### Update Event Status
\`\`\`
PATCH /api/events/:eventId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "SWAPPABLE"
}

Response: Updated event object
\`\`\`

#### Delete Event
\`\`\`
DELETE /api/events/:eventId
Authorization: Bearer <token>

Response:
{
  "success": true
}
\`\`\`

### Swap Endpoints

#### Get Swappable Slots
\`\`\`
GET /api/swap/swappable-slots
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "owner_id": "uuid",
    "name": "Alice Johnson",
    "title": "Team Meeting",
    "start_time": "2024-01-15T10:00:00",
    "end_time": "2024-01-15T11:00:00",
    "status": "SWAPPABLE"
  }
]
\`\`\`

#### Request a Swap
\`\`\`
POST /api/swap/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "mySlotId": "uuid",
  "theirSlotId": "uuid"
}

Response:
{
  "id": "uuid",
  "requester_id": "uuid",
  "requester_slot_id": "uuid",
  "target_slot_id": "uuid",
  "status": "PENDING",
  "created_at": "2024-01-14T12:00:00"
}
\`\`\`

#### Get Incoming Swap Requests
\`\`\`
GET /api/swap/incoming
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "requester_id": "uuid",
    "requester_name": "Alice Johnson",
    "requester_email": "alice@example.com",
    "my_slot_title": "Focus Block",
    "my_slot_start": "2024-01-15T14:00:00",
    "my_slot_end": "2024-01-15T15:00:00",
    "their_slot_title": "Team Meeting",
    "their_slot_start": "2024-01-15T10:00:00",
    "their_slot_end": "2024-01-15T11:00:00",
    "status": "PENDING"
  }
]
\`\`\`

#### Get Outgoing Swap Requests
\`\`\`
GET /api/swap/outgoing
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "requester_id": "uuid",
    "target_user_name": "Bob Smith",
    "target_user_email": "bob@example.com",
    "my_slot_title": "Team Meeting",
    "my_slot_start": "2024-01-15T10:00:00",
    "my_slot_end": "2024-01-15T11:00:00",
    "their_slot_title": "Focus Block",
    "their_slot_start": "2024-01-15T14:00:00",
    "their_slot_end": "2024-01-15T15:00:00",
    "status": "PENDING"
  }
]
\`\`\`

#### Respond to Swap Request
\`\`\`
POST /api/swap/response/:requestId
Authorization: Bearer <token>
Content-Type: application/json

{
  "accept": true
}

Response:
{
  "id": "uuid",
  "status": "ACCEPTED",
  "updated_at": "2024-01-14T12:30:00"
}
\`\`\`

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change it in `.env`:
\`\`\`
PORT=5001
\`\`\`

### Database Locked
If you get a "database locked" error, ensure only one instance of the server is running.

### JWT Errors
Make sure you're sending the token in the Authorization header:
\`\`\`
Authorization: Bearer <your_token_here>
\`\`\`

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Switch to PostgreSQL or MySQL for better scalability
- [ ] Add proper error logging
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure CORS properly for production domain
- [ ] Add rate limiting
- [ ] Enable request validation
