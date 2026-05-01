# TaskManager - ethara-team-task-manager

A team task management app built with Next.js and MongoDB.

**Live** - https://ethara-team-task-manager-production.up.railway.app/

## Features

- **Auth** — Signup, login, logout with JWT cookies
- **Dashboard** — Stats overview, recent tasks, projects at a glance
- **Projects** — Create projects, add members, view project details
- **Tasks** — Create tasks, assign to users, set due dates, update status
- **Roles** — Admin can create projects/tasks and manage members. Members can view and update task status.
- **Responsive** — Works on desktop and mobile

## Tech Stack

- Next.js 16 (App Router)
- MongoDB + Mongoose
- Tailwind CSS v4
- JWT auth (httpOnly cookies)
- bcryptjs for password hashing

## Setup

1. Clone the repo
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Run dev server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── api/
│   ├── auth/        # login, signup, logout, me
│   ├── dashboard/   # dashboard stats
│   ├── projects/    # CRUD projects
│   ├── tasks/       # CRUD tasks
│   └── users/       # list users
├── dashboard/       # dashboard page
├── projects/        # projects list + [id] detail
├── tasks/           # tasks list + [id] detail
├── login/           # login page
├── signup/          # signup page
└── layout.js        # root layout
components/
└── Header.jsx       # auth-aware header + mobile nav
models/
├── User.js
├── Task.js
└── Project.js
middleware/
└── auth.js          # JWT auth middleware
lib/
├── db.js            # MongoDB connection
└── jwt.js           # token sign/verify
```

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/signup | No | Create account |
| POST | /api/auth/login | No | Login |
| POST | /api/auth/logout | No | Logout |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/dashboard | Yes | Dashboard stats |
| GET | /api/projects | Yes | List projects |
| POST | /api/projects | Admin | Create project |
| GET | /api/projects/:id | Yes | Project detail + tasks |
| PUT | /api/projects/:id | Admin | Update project |
| GET | /api/tasks | Yes | List tasks |
| POST | /api/tasks | Admin | Create task |
| GET | /api/tasks/:id | Yes | Task detail |
| PATCH | /api/tasks/:id | Yes | Update task status |
| GET | /api/users | Yes | List all users |
