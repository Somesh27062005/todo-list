//create min-express app
import express from "express";
import { hash, compare } from "bcryptjs";
import { UserModel } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
const { sign } = jwt;
export const userRoute = express.Router();

//Define API routes

//Route for User registration
userRoute.post("/user", async (req, res) => {
  try {
    //get user obj
    let newUser = req.body;
    //hash password
    let hashedPassword = await hash(newUser.password, 12);
    //replace plain password with hashed password
    newUser.password = hashedPassword;
    //create new user doc
    let newUserDoc = new UserModel(newUser);
    //save in db
    await newUserDoc.save();
    //send res
    res.status(201).json({ message: "user created" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Route for User authentication(Login)
userRoute.post("/login", async (req, res) => {
  try {
    //get user cred obj
    let credObj = req.body;
    //check email
    let userInDb = await UserModel.findOne({ email: credObj.email });
    //if user not found
    if (userInDb === null) {
      res.status(404).json({ message: "Invalid Email" });
    } else {
      //compare password
      let isEqual = await compare(credObj.password, userInDb.password);
      //if passwords not matched
      if (isEqual === false) {
        res.status(404).json({ message: "Invalid password" });
      } else {
        //generate token
        let encodedToken = sign({ email: userInDb.email }, "abcdef", { expiresIn: "1h" });
        //save in cookies
        res.cookie("token", encodedToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });
        //send res
        res.status(200).json({ message: "login success", payload: userInDb });
      }
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})


//Logout User
userRoute.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: true 
  });
  //res
  res.status(200).json({ message: "Logout success" });
});





//Route to add new todo
userRoute.put("/todo/:userid", async (req, res) => {
  //get new task obj
  let newTask = req.body;
  //get userid from url
  let uid = req.params.userid;
  //push newtask to "todos" array of user obj
  let userAfterAddingTodo = await UserModel.findOneAndUpdate(
    { _id: uid },
    { $push: { todos: newTask } },
    { new: true }
  );
  //send res
  res.status(200).json({ message: "todo added", payload: userAfterAddingTodo });
});

//Route to edit task
userRoute.put("/edit-todo/userid/:userid/taskid/:taskid", async (req, res) => {
  try {
    //get userid and taskid from url params
    let { userid, taskid } = req.params; //{userid:"",taskid:""}
    console.log(userid,taskid)
    //get modifed taskobj
    let modifiedTaskObj = req.body;
    //update task
    let userWithModifiedTask = await UserModel.findOneAndUpdate(
      { _id: userid, "todos._id": taskid },
      {
        $set: {
          "todos.$.taskName": modifiedTaskObj.taskName,
          "todos.$.description": modifiedTaskObj.description,
          "todos.$.status": modifiedTaskObj.status,
        },
      },
      { new: true }
    );

    //send res
    res.status(200).json({ message: "task modified", payload: userWithModifiedTask });
  } catch (err) {}
});

//Route to set task as completed
userRoute.put("/edit-status/userid/:userid/taskid/:taskid", async (req, res) => {
  try {
    //get userid and taskid from url params
    let { userid, taskid } = req.params; //{userid:"",taskid:""}

    //update task by changing status to "completed"
    let userWithModifiedTask = await UserModel.findOneAndUpdate(
      { _id: userid, "todos._id": taskid },
      {
        $set: {
          "todos.$.status": "completed",
        },
      },
      { new: true }
    );

    //send res
    res.status(200).json({ message: "task status modified", payload: userWithModifiedTask });
  } catch (err) {}
});

//Route to delete a task
userRoute.put("/delete-todo/userid/:userid/taskid/:taskid", async (req, res) => {
  try {
    //get userid and taskid from url params
    let { userid, taskid } = req.params; //{userid:"",taskid:""}

    //update task by changing status to "completed"
    let userWithModifiedTask = await UserModel.findOneAndUpdate(
      { _id: userid },
      { $pull: { todos: { _id: taskid } } },
      { new: true }
    );

    //send res
    res.status(200).json({ message: "task deleted", payload: userWithModifiedTask });
  } catch (err) {}
});
