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
app.use(express.json());
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
      return res.status(401).json({ message: "Session invalid. Please log in again." });
    }
    return res.status(200).json({ message: "success", payload: userObj });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to refresh session" });
  }
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
