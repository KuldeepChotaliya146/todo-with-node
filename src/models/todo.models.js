import mongoose from "mongoose";

const todoSchema = mongoose.Schema({
  content: {
    type: String,
    required: [true, "Content is required!"]
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

export const Todo = mongoose.model("Todo", todoSchema)