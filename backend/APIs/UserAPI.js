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
const HAS_LETTER_REGEX = /\p{L}/u;
const MAX_DUE_DATE_STR = "2100-12-31";

function getReferenceTodayStr(tzOffsetMinutes) {
  const numericOffset = Number(tzOffsetMinutes);
  const offsetMs =
    Number.isFinite(numericOffset) && numericOffset >= -840 && numericOffset <= 840
      ? numericOffset * 60 * 1000
      : 0;
  return new Date(Date.now() - offsetMs).toISOString().slice(0, 10);
}

function parseRequiredDueDate(dueDateValue) {
  if (dueDateValue === undefined || dueDateValue === null) {
    return { valid: false, missing: true, value: null, dateStr: "" };
  }
  if (typeof dueDateValue !== "string") {
    return { valid: false, missing: false, value: null, dateStr: "" };
  }

  const raw = dueDateValue.trim();
  if (!raw) {
    return { valid: false, missing: true, value: null, dateStr: "" };
  }

  const isoDateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const isoTimestampMatch = raw.match(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
  );

  let dateStr;
  let parsed;

  if (isoDateMatch) {
    const year = Number(isoDateMatch[1]);
    const month = Number(isoDateMatch[2]);
    const day = Number(isoDateMatch[3]);
    const probe = new Date(Date.UTC(year, month - 1, day));
    if (
      probe.getUTCFullYear() !== year ||
      probe.getUTCMonth() !== month - 1 ||
      probe.getUTCDate() !== day
    ) {
      return { valid: false, missing: false, value: null, dateStr: "" };
    }
    dateStr = raw;
    parsed = probe;
  } else if (isoTimestampMatch) {
    parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return { valid: false, missing: false, value: null, dateStr: "" };
    }
    dateStr = parsed.toISOString().slice(0, 10);
  } else {
    return { valid: false, missing: false, value: null, dateStr: "" };
  }

  if (dateStr > MAX_DUE_DATE_STR || dateStr < "1900-01-01") {
    return { valid: false, missing: false, value: null, dateStr: "" };
  }

  return { valid: true, missing: false, value: parsed, dateStr };
}

// Route for User registration
userRoute.post("/user", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (trimmedName.length < 2 || trimmedName.length > 50 || !HAS_LETTER_REGEX.test(trimmedName)) {
      return res.status(400).json({
        message: "Name must be 2-50 characters and contain at least one letter",
      });
    }
    if (normalizedEmail.length > 100 || !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }
    if (
      typeof password !== "string" ||
      password.trim().length < 6 ||
      password.length > 72 ||
      password !== password.trim()
    ) {
      return res.status(400).json({
        message: "Password must be 6-72 characters without leading or trailing spaces",
      });
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

    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail) || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Valid email and password are required" });
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

    const { taskName, description, dueDate, tzOffset } = req.body || {};
    const trimmedTitle = typeof taskName === "string" ? taskName.trim() : "";
    const trimmedDescription = typeof description === "string" ? description.trim() : "";

    if (!trimmedTitle) {
      return res.status(400).json({ message: "Task title is required" });
    }
    if (trimmedTitle.length > 120) {
      return res.status(400).json({ message: "Task title must be 120 characters or fewer" });
    }
    if (!trimmedDescription) {
      return res.status(400).json({ message: "Task description is required" });
    }
    if (trimmedDescription.length > 500) {
      return res.status(400).json({ message: "Task description must be 500 characters or fewer" });
    }

    const due = parseRequiredDueDate(dueDate);
    if (!due.valid) {
      return res.status(400).json({
        message: due.missing ? "Due date is required" : "Invalid due date format",
      });
    }

    const todayStr = getReferenceTodayStr(tzOffset);
    if (due.dateStr < todayStr) {
      return res.status(400).json({ message: "Due date cannot be in the past" });
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

    const { taskName, description, dueDate, tzOffset } = req.body || {};
    const trimmedTitle = typeof taskName === "string" ? taskName.trim() : "";
    const trimmedDescription = typeof description === "string" ? description.trim() : "";

    if (!trimmedTitle) {
      return res.status(400).json({ message: "Task title is required" });
    }
    if (trimmedTitle.length > 120) {
      return res.status(400).json({ message: "Task title must be 120 characters or fewer" });
    }
    if (!trimmedDescription) {
      return res.status(400).json({ message: "Task description is required" });
    }
    if (trimmedDescription.length > 500) {
      return res.status(400).json({ message: "Task description must be 500 characters or fewer" });
    }

    const due = parseRequiredDueDate(dueDate);
    if (!due.valid) {
      return res.status(400).json({
        message: due.missing ? "Due date is required" : "Invalid due date format",
      });
    }

    // Check task exists, is pending, and check past due date against existing due date
    const existingDoc = await UserModel.findOne({
      _id: userid,
      email: req.user.email,
      "todos._id": taskid,
    });

    if (!existingDoc) {
      return res.status(404).json({ message: "Task not found" });
    }

    const existingTask = existingDoc.todos.id(taskid);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (existingTask.status === "completed") {
      return res.status(400).json({ message: "Completed tasks cannot be edited" });
    }

    const todayStr = getReferenceTodayStr(tzOffset);
    const existingDueStr = existingTask.dueDate
      ? existingTask.dueDate.toISOString().slice(0, 10)
      : "";
    if (due.dateStr < todayStr && due.dateStr !== existingDueStr) {
      return res.status(400).json({ message: "Due date cannot be in the past" });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: userid,
        email: req.user.email,
        todos: { $elemMatch: { _id: taskid, status: "pending" } },
      },
      {
        $set: {
          "todos.$.taskName": trimmedTitle,
          "todos.$.description": trimmedDescription,
          "todos.$.dueDate": due.value,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "Completed tasks cannot be edited" });
    }

    return res.status(200).json({ message: "task modified", payload: updatedUser });
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

    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: userid,
        email: req.user.email,
        todos: { $elemMatch: { _id: taskid, status: "pending" } },
      },
      {
        $set: {
          "todos.$.status": "completed",
          "todos.$.completedAt": new Date(),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      const existing = await UserModel.findOne({
        _id: userid,
        email: req.user.email,
        "todos._id": taskid,
      });
      if (existing) {
        return res.status(400).json({ message: "Completed tasks cannot be reopened" });
      }
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "task status modified", payload: updatedUser });
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
