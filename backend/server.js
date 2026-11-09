import "dotenv/config";
import express from "express";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { userRoute } from "./APIs/UserAPI.js";
import { verifyToken } from "./middlewares/verifyToken.js";
import { UserModel } from "./models/UserModel.js";

const app = express();

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/taskflowdb";
const rawClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const clientUrl = rawClientUrl.replace(/\/$/, "");

const isProduction = process.env.NODE_ENV === "production";
const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const allowedOrigins = [
  clientUrl,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
];

// Enable CORS
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Add body parser middleware
app.use(express.json({ limit: "100kb" }));
// Add cookie parser middleware
app.use(cookieParser());

// Root API status route
app.get("/", (req, res) => {
  res.status(200).json({ message: "TaskFlow MERN API Server is Running", status: "OK" });
});

// Forward /user-api requests to userRoute
app.use("/user-api", userRoute);

// Page refresh route
app.get("/refresh", verifyToken, async (req, res) => {
  try {
    const userObj = await UserModel.findOne({ email: req.user.email });
    if (!userObj) {
      res.clearCookie("token", baseCookieOptions);
      return res.status(401).json({ message: "Session invalid. Please log in again." });
    }
    return res.status(200).json({ message: "success", payload: userObj });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to refresh session" });
  }
});

// Unknown API route handler
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Global error handler (e.g., malformed JSON or CORS rejection)
app.use((err, req, res, _next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON request body" });
  }
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origin not allowed by CORS" });
  }
  return res.status(err?.status || 500).json({ message: err?.message || "Internal server error" });
});

// Connect to DB and start HTTP server
async function connectDBAndStartServer() {
  try {
    console.log("Connecting to MongoDB...");
    await connect(MONGO_URI);
    console.log("DB connection success");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error("FATAL ERROR: Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
}

connectDBAndStartServer();
