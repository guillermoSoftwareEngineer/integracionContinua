# spendr-backend

A NodeJS backend for tracking personal expenses and income, using Express, Drizzle ORM, and SQLite. Supports ES Modules and Dockerized deployment.

## Setup

### Local Development
1. Install dependencies:
```bash
npm install
```
2. Start the server:
```bash
npm run dev
```
The server will start on port 3000 by default.

### Docker Deployment
1. Build and start containers:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
2. Environment variables are set in `.env` and passed to containers:
   - `PORT`: Backend port (default: 3000)
   - `DB_PATH`: SQLite DB path (default: `/app/data/spendr.db`)

## API Endpoints & Controller Info

### Movements

#### Create Movement
- **POST** `/api/movements`
- Body:
  ```json
  {
    "name": "Groceries",
    "category": "Food",
    "value": 50.00,
    "type": "egress"
  }
  ```
- Returns:
  ```json
  { "id": 1 }
  ```
- Controller: Validates input, inserts movement, returns new ID.

#### Update Movement
- **PATCH** `/api/movements/:id`
- Body:
  ```json
  {
    "name": "Updated Name",
    "category": "Updated Category"
  }
  ```
- Returns:
  ```json
  { "message": "Movement updated successfully" }
  ```
- Controller: Only updates name/category, returns success or error.

#### Get Movements
- **GET** `/api/movements`
- Query Parameters:
  - `type`: "ingress" or "egress"
  - `category`: filter by category
  - `startDate`: filter by start date (ISO string)
  - `endDate`: filter by end date (ISO string)
- Returns:
  ```json
  [
    {
      "id": 1,
      "name": "Groceries",
      "category": "Food",
      "value": 50.00,
      "type": "egress",
      "date": 1698883200,
      "createdAt": 1698883200
    },
    // ...more movements
  ]
  ```
- Controller: Returns filtered, ordered list of movements (most recent first).

#### Get Financial Summary
- **GET** `/api/movements/summary`
- Returns:
  ```json
  {
    "total_income": 3000.00,
    "total_expenses": 1500.00,
    "balance": 1500.00
  }
  ```
- Controller: Aggregates all movements, returns totals for income, expenses, and balance.

## Database Schema

### Movements Table
- id: INTEGER PRIMARY KEY
- name: TEXT
- category: TEXT
- value: REAL
- type: TEXT (ingress/egress)
- date: TIMESTAMP
- created_at: TIMESTAMP

## Tech Stack
- Node.js (Express, ES Modules)
- SQLite (Drizzle ORM)
- Docker (multi-container, persistent volume)

## Frontend Integration Notes
- All endpoints return JSON
- Movements list is ordered by most recent
- Summary endpoint is suitable for dashboard charts
- Error responses are JSON with `error` field
- All controllers validate input and return clear status messages