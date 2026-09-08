# 📝 Todo-List (MERN Stack)

A modern full-stack To-Do List web application built with the MERN stack (MongoDB Atlas, Express.js, React + Vite, Node.js).

🚀 **Live Frontend App**: [https://somesh-todo-list.vercel.app/](https://somesh-todo-list.vercel.app/)  
⚙️ **Live Backend API**: [https://todo-list-4b6f.onrender.com](https://todo-list-4b6f.onrender.com)

---

## 🔧 Features

- 👤 **User Authentication**: Secure signup and login using JWT & HTTP-Only cookies.
- ✅ **Task Management**: Create, edit, complete, and delete personal tasks.
- 🕒 **Timestamp Tracking**: Tracks creation (`createdAt`) and completion (`completedAt`) timestamps.
- 🎨 **Modern Design**: Built with Plus Jakarta Sans typography, card containers, status badges, and FontAwesome icons.
- ☁️ **MongoDB Atlas Integration**: Cloud database connectivity with environment variable configuration.
- 🔒 **API Protection**: Protected routes with token verification middleware & CORS configuration.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router DOM, React Hook Form, React Icons, Bootstrap 5
- **Backend**: Node.js, Express.js, Mongoose, JSONWebToken, BcryptJS, Cookie Parser, Dotenv
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## 📁 Project Structure

```text
todo-list/
├── README.md               # Project documentation
├── req.http                # REST API test endpoints
├── .gitignore
├── backend/
│   ├── .env.example        # Environment variable template
│   ├── package.json
│   ├── server.js           # Express app & MongoDB connection
│   ├── APIs/
│   │   └── UserAPI.js      # User authentication & Todo CRUD routes
│   ├── middlewares/
│   │   └── verifyToken.js  # JWT authentication middleware
│   └── models/
│       └── UserModel.js    # Mongoose user & todo schema
└── frontend/
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── config.js       # Dynamic API base URL configuration
    │   ├── index.css      # Theme variables & custom styling
    │   ├── components/
    │   │   ├── CreateTask.jsx
    │   │   ├── Header.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── RootLayout.jsx
    │   │   ├── TaskList.jsx
    │   │   └── UserProfile.jsx
    │   └── contexts/
    │       └── LoginContext.jsx
```

---

## 🚀 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Somesh27062005/todo-list.git
   cd todo-list
   ```

2. **Setup & Run Backend**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Setup & Run Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.
