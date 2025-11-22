# TaskFlow - Full-Stack Task Manager (COMP3810SEF / COMPS381F Group Project)

**Group No.:** 1  
**Members:**  
- Chan Tai Man (SID: 123456789)  
- Wong Siu Ming (SID: 987654321)  

## 1. Project Files Introduction

- **server.js**: Main Express server with session auth (cookie-session via connect-mongo), protected CRUD routes, and public RESTful APIs.
- **package.json**: All required dependencies (express, mongoose, bcrypt, ejs, etc.)
- **public/css/style.css**: Clean modern UI styling
- **views/**: EJS templates with login/register, task list (with advanced filters), create/edit forms
- **models/Task.js & User.js**: Mongoose schemas

## 2. Cloud Server URL (Example)

https://comp3810sef-group1.onrender.com

(Replace with your actual deployed URL – Render, Railway, Cyclic, or any free tier)

## 3. Operation Guide

### Login / Register
- Default test account (create via register page):
  - Username: `admin`
  - Password: `123456`
- Or register a new account at `/register`

### CRUD Web Pages (protected)
- After login → go to `/tasks`
- **Create**: Click "+ New Task"
- **Read**: List with filters (title, status, priority, due date ≤)
- **Update**: Click "Edit" on any task
- **Delete**: Click "Delete" button (with confirmation)

### RESTful APIs (no authentication required)

| Method | URL                  | Description           | Example cURL |
|--------|----------------------|-----------------------|--------------|
| GET    | `/api/tasks`         | Get all tasks         | `curl https://your-url.onrender.com/api/tasks` |
| POST   | `/api/tasks`         | Create task (JSON)    | `curl -X POST -H "Content-Type: application/json" -d '{"title":"API Task","status":"pending"}' https://your-url.onrender.com/api/tasks` |
| PUT    | `/api/tasks/:id`     | Update task           | `curl -X PUT -H "Content-Type: application/json" -d '{"title":"Updated"}' https://your-url.onrender.com/api/tasks/675d8e8e1e2e3f4a5b6c7d8e` |
| DELETE | `/api/tasks/:id`     | Delete task           | `curl -X DELETE https://your-url.onrender.com/api/tasks/675d8e8e1e2e3f4a5b6c7d8e` |

## Deployment Notes
- Uses MongoDB Atlas (free tier) or local MongoDB
- `.env` file contains:  
  `MONGO_URI=mongodb+srv://...`  
  `SESSION_SECRET=yoursecret`

This project satisfies **all compulsory requirements + bonus points** for diverse queries and fancy UI.
