import { Schema, model } from "mongoose";

const todoSchema = new Schema({
  taskName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  dueDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

// Create user schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    todos: [todoSchema],
  },
  {
    versionKey: false,
    timestamps: true,
    strict: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Generate user model for the above user schema
export const UserModel = model("user", userSchema);
