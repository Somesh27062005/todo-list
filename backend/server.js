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
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

//enable cors
app.use(cors({ origin: [CLIENT_URL], credentials: true }));
//add body parser middleware
app.use(express.json());
//add cookie parser middleware
app.use(cookieParser());

//if path starts with /user-api. forward req to UserROute
app.use("/user-api", userRoute);

//connect to db
async function connectDBAndStartServer() {
  try {
    //connect to database server
    await connect(MONGO_URI);
    console.log("DB connection success");
    //start HTTP server
    app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
  } catch (err) {
    console.log("Err in DB connection :", err);
  }
}

connectDBAndStartServer();

//page refresh route
app.get("/refresh",verifyToken,async(req,res)=>{
  console.log("user is ",req.user)
  let userObj=await UserModel.findOne({email:req.user.email});
  res.status(200).json({message:"success",payload:userObj});
})