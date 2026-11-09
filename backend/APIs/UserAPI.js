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

const VALID_PRIORITIES = new Set(["low", "medium", "high"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePriority(priority) {
  if (typeof priority === "string" && VALID_PRIORITIES.has(priority.toLowerCase())) {
    return priority.toLowerCase();
  }
  return "medium";
}

function parseDueDate(dueDateValue) {
  if (dueDateValue === undefined || dueDateValue === null || dueDateValue === "") {
    return { valid: true, value: null };
  }
  const parsed = new Date(dueDateValue);
  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, value: null };
  }
  return { valid: true, value: parsed };
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

    const { taskName, description, priority, category, dueDate } = req.body || {};
    const trimmedTitle = typeof taskName === "string" ? taskName.trim() : "";

    if (!trimmedTitle) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const due = parseDueDate(dueDate);
    if (!due.valid) {
      return res.status(400).json({ message: "Invalid due date format" });
    }

    const newTask = {
      taskName: trimmedTitle,
      description: typeof description === "string" ? description.trim() : "",
      status: "pending",
      priority: normalizePriority(priority),
      category: typeof category === "string" && category.trim() ? category.trim() : "General",
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

// Route to edit task
userRoute.put("/edit-todo/userid/:userid/taskid/:taskid", verifyToken, async (req, res) => {
  try {
    const { userid, taskid } = req.params;
    if (!isValidObjectId(userid) || !isValidObjectId(taskid)) {
      return res.status(400).json({ message: "Invalid user or task ID" });
    }

    const { taskName, description, priority, category, dueDate, status } = req.body || {};
    const trimmedTitle = typeof taskName === "string" ? taskName.trim() : "";

    if (!trimmedTitle) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const due = parseDueDate(dueDate);
    if (!due.valid) {
      return res.status(400).json({ message: "Invalid due date format" });
    }

    const updateFields = {
      "todos.$.taskName": trimmedTitle,
      "todos.$.description": typeof description === "string" ? description.trim() : "",
    };

    if (priority !== undefined) {
      updateFields["todos.$.priority"] = normalizePriority(priority);
    }
    if (category !== undefined) {
      updateFields["todos.$.category"] =
        typeof category === "string" && category.trim() ? category.trim() : "General";
    }
    if (dueDate !== undefined) {
      updateFields["todos.$.dueDate"] = due.value;
    }
    if (status === "completed") {
      updateFields["todos.$.status"] = "completed";
      updateFields["todos.$.completedAt"] = new Date();
    } else if (status === "pending") {
      updateFields["todos.$.status"] = "pending";
      updateFields["todos.$.completedAt"] = null;
    }

    const userWithModifiedTask = await UserModel.findOneAndUpdate(
      { _id: userid, email: req.user.email, "todos._id": taskid },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!userWithModifiedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "task modified", payload: userWithModifiedTask });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to modify task" });
  }
});

// Route to toggle or set task status (pending <-> completed)
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

    const requestedStatus = req.body?.status;
    let nextStatus;
    if (requestedStatus === "completed" || requestedStatus === "pending") {
      nextStatus = requestedStatus;
    } else {
      nextStatus = targetTask.status === "completed" ? "pending" : "completed";
    }

    targetTask.status = nextStatus;
    targetTask.completedAt = nextStatus === "completed" ? new Date() : null;

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
