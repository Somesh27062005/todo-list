<div align="center">

  # 📝 TaskFlow — Full-Stack MERN Todo Application

  <p align="center">
    A modern, responsive, full-stack Task Management application built with the MERN stack.
  </p>

  [![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)](https://vitejs.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
  [![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)](https://somesh-todo-list.vercel.app/)

  ---

  ### 🌐 [Live App Demo](https://somesh-todo-list.vercel.app/)

</div>

<br />

## 🌟 Key Features

- 🔒 **User Authentication**: Secure Registration & Login using **JWT (JSON Web Tokens)** and **HTTP-Only Cookies**.
- 📋 **Task Management (CRUD)**: Create, view, edit, mark as completed, and delete personal tasks.
- 🎨 **Modern Design System**: Designed with `Plus Jakarta Sans` typography, soft cards, interactive hover states, and FontAwesome icons.
- 🕒 **Timestamp Tracking**: Tracks task creation (`createdAt`) and completion (`completedAt`) dates.
- 🏷️ **Visual Task Statuses**: Strikethrough completed styling, green left accent borders, and status badges (`Completed` vs `Pending`).
- 🛡️ **Protected API Routes**: Backend middleware verifies tokens on all task endpoints.
- ☁️ **Cloud Database**: Powered by **MongoDB Atlas** with multi-tenant database isolation.

<br />

## 🛠️ Tech Stack & Architecture

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Fast Single Page Application UI |
| **Styling** | Bootstrap 5 + Custom CSS | Responsive layout & modern design system |
| **State Management** | React Context API | Global authentication & user state |
| **Form Handling** | React Hook Form | Input validation & smooth submission |
| **Backend** | Node.js + Express.js | RESTful API server & middleware routing |
| **Database** | MongoDB Atlas + Mongoose | Cloud NoSQL database & ODM schema validation |
| **Security** | JWT + Cookie-Parser + BcryptJS | Token signing, encrypted passwords & secure cookies |
| **Deployment** | Vercel + Render | Decoupled CI/CD frontend & backend hosting |

<br />

## 📁 Repository Structure

```text
todo-list/
├── README.md                 # Project documentation
├── req.http                  # REST Client API test suite
├── .gitignore                # Git ignore rules
│
├── backend/                  # Express API Server
│   ├── server.js             # Server entry point & DB connection
│   ├── .env.example          # Environment variable template
│   ├── APIs/
│   │   └── UserAPI.js        # Auth & Task CRUD handlers
│   ├── middlewares/
│   │   └── verifyToken.js    # JWT authentication middleware
│   └── models/
│       └── UserModel.js      # User & Todo Mongoose schemas
│
└── frontend/                 # React + Vite Client
    ├── index.html            # HTML entry point
    ├── vite.config.js        # Vite configuration
    └── src/
        ├── App.jsx           # Main React router
        ├── config.js         # Dynamic API URL resolver
        ├── index.css        # Global CSS variables & components
        ├── components/
        │   ├── Header.jsx    # Navbar with brand logo & auth controls
        │   ├── Login.jsx     # User Login card component
        │   ├── Register.jsx  # User Registration card component
        │   ├── UserProfile.jsx# User Dashboard layout
        │   ├── CreateTask.jsx# New Task creation card
        │   └── TaskList.jsx  # Task list cards & edit modal
        └── contexts/
            └── LoginContext.jsx # Global user auth state
```

<br />

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/user-api/user` | Register a new user | ❌ |
| `POST` | `/user-api/login` | Authenticate user & issue JWT cookie | ❌ |
| `GET` | `/user-api/logout` | Clear authentication token cookie | ❌ |
| `GET` | `/refresh` | Verify session & fetch current user payload | `verifyToken` |
| `PUT` | `/user-api/todo/:userid` | Add a new task to user's list | `verifyToken` |
| `PUT` | `/user-api/edit-todo/userid/:userid/taskid/:taskid` | Edit task title & description | `verifyToken` |
| `PUT` | `/user-api/edit-status/userid/:userid/taskid/:taskid` | Mark task status as completed | `verifyToken` |
| `PUT` | `/user-api/delete-todo/userid/:userid/taskid/:taskid` | Remove a task from user's list | `verifyToken` |

<br />

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `8000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/pvptododb` |
| `SECRET_KEY` | 256-bit JWT secret signing key | `e495f821e8e15e49a461f79f1f7543d937daae5ee...` |
| `CLIENT_URL` | Frontend URL for CORS origin | `https://somesh-todo-list.vercel.app` |

### Frontend (`Vercel Environment`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Deployed backend server API base URL | `https://todo-list-4b6f.onrender.com` |

<br />

## 🚀 Quickstart Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Somesh27062005/todo-list.git
   cd todo-list
   ```

2. **Configure & Start Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file from .env.example
   npm run dev
   ```

3. **Configure & Start Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   Open `http://localhost:5173` in your browser.

<br />

---

<div align="center">
  <sub>Built with ❤️ using React, Node.js, Express & MongoDB Atlas.</sub>
</div>
