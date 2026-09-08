import "dotenv/config";
import express from "express";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import { userRoute } from "./APIs/UserAPI.js";
import cors from "cors";
import { verifyToken } from "./middlewares/verifyToken.js";
import { UserModel } from "./models/UserModel.js";
const app = express();

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/pvptododb";
const rawClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const clientUrl = rawClientUrl.replace(/\/$/, "");

//enable cors
app.use(
  cors({
    origin: [clientUrl, "http://localhost:5173"],
    credentials: true,
  })
);
//add body parser middleware
app.use(express.json());
//add cookie parser middleware
app.use(cookieParser());

//Root API status route
app.get("/", (req, res) => {
  res.status(200).json({ message: "TaskFlow MERN API Server is Running", status: "OK" });
});

//if path starts with /user-api. forward req to UserROute
app.use("/user-api", userRoute);

//connect to db
async function connectDBAndStartServer() {
  try {
    console.log("Connecting to MongoDB...");
    await connect(MONGO_URI);
    console.log("DB connection success");
    //start HTTP server
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error("FATAL ERROR: Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
}

connectDBAndStartServer();

//page refresh route
app.get("/refresh",verifyToken,async(req,res)=>{
  console.log("user is ",req.user)
  let userObj=await UserModel.findOne({email:req.user.email});
  res.status(200).json({message:"success",payload:userObj});
})