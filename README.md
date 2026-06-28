# TaskFlow — MERN Stack Task Tracker

A full-stack Task Tracker web application built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).

---

## Features

### Mandatory
- **CRUD**: Create, View, Update, Delete tasks
- **Form Validation**: Client-side + server-side via `express-validator`
- **REST API**: Full RESTful API with proper HTTP methods and status codes
- **MongoDB Integration**: Mongoose ODM with indexed schema
- **Responsive UI**: Mobile-first design, works on all screen sizes
- **Dynamic Updates**: No page refresh — all state updates via React Context + Axios

### Bonus
- **Filtering**: Filter by status (Todo / In Progress / Completed) and priority (Low / Medium / High)
- **Sorting**: Sort by newest, oldest, priority, due date, or title
- **Search**: Real-time debounced search across title and description
- **Notifications**: Toast notifications for all actions (react-hot-toast)
- **Stats Dashboard**: Live task counts by status
- **Quick Status Toggle**: Click the status badge on any card to advance its status
- **Overdue Detection**: Overdue tasks are highlighted automatically
- **Tags**: Attach multiple tags to tasks
- **Environment Variables**: `.env` files for both backend and frontend
- **Reusable Components**: TaskCard, TaskForm, FilterBar, StatsBar, TaskContext

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Context, Axios          |
| Backend   | Node.js, Express.js                     |
| Database  | MongoDB Atlas, Mongoose                 |
| Validation| express-validator (server), custom (client) |
| Notifications | react-hot-toast                     |
| Deployment | Render (backend), Vercel (frontend)    |

---

## Project Structure

```
task-tracker/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── errorHandler.js    # Global error handler + asyncHandler
│   ├── models/
│   │   └── Task.js            # Mongoose Task schema
│   ├── routes/
│   │   └── tasks.js           # All CRUD routes + stats
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── FilterBar.jsx  # Search + filter + sort controls
│   │   │   ├── StatsBar.jsx   # Task count statistics
│   │   │   ├── TaskCard.jsx   # Individual task display
│   │   │   └── TaskForm.jsx   # Create/Edit modal form
│   │   ├── context/
│   │   │   └── TaskContext.jsx # Global state (useReducer)
│   │   ├── utils/
│   │   │   └── api.js         # Axios instance + API methods
│   │   ├── App.js             # Root component
│   │   └── App.css            # All styles
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json               # Root (runs both with concurrently)
├── render.yaml                # Render backend deploy config
├── vercel.json                # Vercel frontend deploy config
└── README.md
```

---

## API Endpoints

| Method | Endpoint                    | Description                     |
|--------|-----------------------------|---------------------------------|
| GET    | `/api/tasks`                | Get all tasks (with filters)    |
| GET    | `/api/tasks/:id`            | Get single task                 |
| POST   | `/api/tasks`                | Create a task                   |
| PUT    | `/api/tasks/:id`            | Update a task                   |
| PATCH  | `/api/tasks/:id/status`     | Quick status update             |
| DELETE | `/api/tasks/:id`            | Delete a task                   |
| GET    | `/api/tasks/meta/stats`     | Get task statistics             |
| GET    | `/api/health`               | Health check                    |

### Query Parameters (GET /api/tasks)
| Param    | Values                             |
|----------|------------------------------------|
| status   | `todo`, `in-progress`, `completed` |
| priority | `low`, `medium`, `high`            |
| sort     | `oldest`, `priority-high`, `priority-low`, `due-date`, `title` |
| search   | Any string (searches title + description) |

---

## Local Setup

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- MongoDB Atlas account (free tier is fine)

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/task-tracker.git
cd task-tracker
npm run install-all
```

### 2. Configure Environment Variables

**Backend** — create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/tasktracker?retryWrites=true&w=majority
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Frontend** — create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

```bash
# From project root — starts both backend (port 5000) and frontend (port 3000)
npm run dev
```

Or run separately:
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

---

## Deployment

### Backend → Render (free tier)

1. Push repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGO_URI` → your MongoDB Atlas connection string
   - `NODE_ENV` → `production`
   - `CLIENT_URL` → your Vercel frontend URL (add after frontend deploy)
6. Deploy — note your Render URL (e.g. `https://task-tracker-api.onrender.com`)

### Frontend → Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Create React App
4. Add Environment Variable:
   - `REACT_APP_API_URL` → `https://<your-render-url>.onrender.com/api`
5. Deploy — note your Vercel URL

> **After both are deployed**: Go back to Render → Environment → set `CLIENT_URL` to your Vercel URL → Redeploy.

---

## Task Schema

```js
{
  title:       String   // required, 2-100 chars
  description: String   // optional, max 500 chars
  status:      'todo' | 'in-progress' | 'completed'   // default: 'todo'
  priority:    'low' | 'medium' | 'high'              // default: 'medium'
  dueDate:     Date     // optional
  tags:        [String] // optional array
  createdAt:   Date     // auto
  updatedAt:   Date     // auto
}
```

---

## Author

**Kaustubh Dattatraya Mangnale**
B.Tech Computer Engineering | Vishwakarma University, Pune | Batch 2027
