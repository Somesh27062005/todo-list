import express from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const { sign } = jwt;
export const userRoute = express.Router();

const isProduction = process.env.NODE_ENV === "production";
const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseRequiredDueDate(dueDateValue) {
  if (dueDateValue === undefined || dueDateValue === null || String(dueDateValue).trim() === "") {
    return { valid: false, missing: true, value: null };
  }
  const parsed = new Date(dueDateValue);
  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, missing: false, value: null };
  }
  return { valid: true, missing: false, value: parsed };
}

// Route for User registration
userRoute.post("/user", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (trimmedName.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters long" });
    }
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await hash(password, 12);
    const newUserDoc = new UserModel({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      todos: [],
    });

    await newUserDoc.save();
    return res.status(201).json({ message: "user created" });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    return res.status(400).json({ message: err.message || "Registration failed" });
  }
});

// Route for User authentication (Login)
userRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const userInDb = await UserModel.findOne({ email: normalizedEmail });
    if (!userInDb) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isEqual = await compare(password, userInDb.password);
    if (!isEqual) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const secretKey = process.env.SECRET_KEY || "abcdef";
    const encodedToken = sign(
      { id: userInDb._id.toString(), email: userInDb.email },
      secretKey,
      { expiresIn: "7d" }
    );

    res.cookie("token", encodedToken, {
      ...baseCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "login success", payload: userInDb });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Login failed" });
  }
});

// Logout User
userRoute.get("/logout", (req, res) => {
  res.clearCookie("token", baseCookieOptions);
  return res.status(200).json({ message: "Logout success" });
});

// Route to add new todo
userRoute.put("/todo/:userid", verifyToken, async (req, res) => {
  try {
    const { userid } = req.params;
    if (!isValidObjectId(userid)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const { taskName, description, dueDate } = req.body || {};
    const trimmedTitle = typeof taskName === "string" ? taskName.trim() : "";
    const trimmedDescription = typeof description === "string" ? description.trim() : "";

    if (!trimmedTitle) {
      return res.status(400).json({ message: "Task title is required" });
    }
    if (!trimmedDescription) {
      return res.status(400).json({ message: "Task description is required" });
    }

    const due = parseRequiredDueDate(dueDate);
    if (!due.valid) {
      return res.status(400).json({
        message: due.missing ? "Due date is required" : "Invalid due date format",
      });
    }

    const newTask = {
      taskName: trimmedTitle,
      description: trimmedDescription,
      status: "pending",
      dueDate: due.value,
      createdAt: new Date(),
      completedAt: null,
    };

    const userAfterAddingTodo = await UserModel.findOneAndUpdate(
      { _id: userid, email: req.user.email },
      { $push: { todos: newTask } },
      { new: true, runValidators: true }
    );

    if (!userAfterAddingTodo) {
      return res.status(404).json({ message: "User not found or unauthorized" });
    }

    return res.status(200).json({ message: "todo added", payload: userAfterAddingTodo });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to add task" });
  }
});

// Route to edit a pending task (completed tasks cannot be edited)
userRoute.put("/edit-todo/userid/:userid/taskid/:taskid", verifyToken, async (req, res) => {
  try {
    const { userid, taskid } = req.params;
    if (!isValidObjectId(userid) || !isValidObjectId(taskid)) {
      return res.status(400).json({ message: "Invalid user or task ID" });
    }

    const { taskName, description, dueDate } = req.body || {};
    const trimmedTitle = typeof taskName === "string" ? taskName.trim() : "";
    const trimmedDescription = typeof description === "string" ? description.trim() : "";

    if (!trimmedTitle) {
      return res.status(400).json({ message: "Task title is required" });
    }
    if (!trimmedDescription) {
      return res.status(400).json({ message: "Task description is required" });
    }

    const due = parseRequiredDueDate(dueDate);
    if (!due.valid) {
      return res.status(400).json({
        message: due.missing ? "Due date is required" : "Invalid due date format",
      });
    }

    const userDoc = await UserModel.findOne({
      _id: userid,
      email: req.user.email,
      "todos._id": taskid,
    });

    if (!userDoc) {
      return res.status(404).json({ message: "Task not found" });
    }

    const targetTask = userDoc.todos.id(taskid);
    if (!targetTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (targetTask.status === "completed") {
      return res.status(400).json({ message: "Completed tasks cannot be edited" });
    }

    targetTask.taskName = trimmedTitle;
    targetTask.description = trimmedDescription;
    targetTask.dueDate = due.value;

    await userDoc.save();

    return res.status(200).json({ message: "task modified", payload: userDoc });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to modify task" });
  }
});

// Route to mark a pending task as completed (cannot be reopened once completed)
userRoute.put("/edit-status/userid/:userid/taskid/:taskid", verifyToken, async (req, res) => {
  try {
    const { userid, taskid } = req.params;
    if (!isValidObjectId(userid) || !isValidObjectId(taskid)) {
      return res.status(400).json({ message: "Invalid user or task ID" });
    }

    const userDoc = await UserModel.findOne({
      _id: userid,
      email: req.user.email,
      "todos._id": taskid,
    });

    if (!userDoc) {
      return res.status(404).json({ message: "Task not found" });
    }

    const targetTask = userDoc.todos.id(taskid);
    if (!targetTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (targetTask.status === "completed") {
      return res.status(400).json({ message: "Completed tasks cannot be reopened" });
    }

    targetTask.status = "completed";
    targetTask.completedAt = new Date();

    await userDoc.save();

    return res.status(200).json({ message: "task status modified", payload: userDoc });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to update task status" });
  }
});

// Route to delete a task
userRoute.put("/delete-todo/userid/:userid/taskid/:taskid", verifyToken, async (req, res) => {
  try {
    const { userid, taskid } = req.params;
    if (!isValidObjectId(userid) || !isValidObjectId(taskid)) {
      return res.status(400).json({ message: "Invalid user or task ID" });
    }

    const userWithModifiedTask = await UserModel.findOneAndUpdate(
      { _id: userid, email: req.user.email, "todos._id": taskid },
      { $pull: { todos: { _id: taskid } } },
      { new: true }
    );

    if (!userWithModifiedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "task deleted", payload: userWithModifiedTask });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to delete task" });
  }
});

// Route to clear all completed tasks
userRoute.put("/clear-completed/:userid", verifyToken, async (req, res) => {
  try {
    const { userid } = req.params;
    if (!isValidObjectId(userid)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userid, email: req.user.email },
      { $pull: { todos: { status: "completed" } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found or unauthorized" });
    }

    return res.status(200).json({ message: "completed tasks cleared", payload: updatedUser });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to clear completed tasks" });
  }
});
