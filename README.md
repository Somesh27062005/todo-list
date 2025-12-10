# 📝 Todo-List (MERN)

A simple full-stack To-Do List web application built with the MERN stack (MongoDB, Express, React, Node).  
Allows users to sign up / log in, and manage their personal to-do tasks via a clean UI + REST API.  

---

## 🔧 What it does / Features

- 👤 User Authentication (signup / login)  
- ✅ Create new todos  
- ✏️ Update/edit existing todos  
- ✔️ Mark todos as completed / not completed  
- 🗑️ Delete todos  
- 📄 List view of all todos for the logged-in user  
- 🔒 Secure backend + MongoDB storage (via Express + Mongoose + MongoDB)  
- 🌐 Frontend UI built with React — responsive and easy to use  

---

## 🛠️ Tech Stack & Structure

- **Frontend**: React (or create-react-app / whichever setup you chose)  
- **Backend**: Node.js + Express.js  
- **Database**: MongoDB (local or cloud, e.g. MongoDB Atlas)  
- **ORM / ODM**: Mongoose (for MongoDB models)  
- **Authentication**: JSON Web Tokens (JWT) and possibly cookies/session — adjust per your implementation  
- **Project Structure** (suggested / typical for MERN) :contentReference[oaicite:1]{index=1}  

## 📁 Project Structure

todo-list/
├── backend/        # Express + Node + MongoDB + Auth logic
├── frontend/       # React UI (components, pages, state, API calls)
├── .gitignore
├── README.md
└── (other config files)



---

## ✅ What I Learned / Why This Project

Building this Todo-List app helped me understand and practice:

- Setting up a full-stack MERN application (frontend, backend, DB)
- Implementing user authentication (JWT, secure routes)
- CRUD operations with MongoDB + Mongoose
- Connecting React frontend to backend API
- Handling state management + async API calls
- Structuring a scalable MERN project

---

## 🗂️ Future Improvements (TODO)

- Add user profile/user settings  
- Add due dates & reminder notifications  
- Add categories/priorities  
- Add filtering, sorting & search  
- Improve UI/UX and mobile responsiveness  
- Add tests (unit + integration)  
- Deploy full MERN stack to cloud  
