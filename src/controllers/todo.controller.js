import asyncHandler  from "../utils/asyncHandler.js";
import { Todo } from "../models/todo.models.js"
import ApiResponse from "../utils/ApiResponse.js"

const getTodos  = asyncHandler( async (req, res) => {
  const currentUserTodos = await Todo.where('user').eq(req.user?._id).exec();
  
  return res.status(200).json(
    new ApiResponse(200, "Todos fetched Successfully!", currentUserTodos)
  )
})

const createTodo = asyncHandler( async (req, res) => {
  const { content }  = req.body;

  if(!content){
    return res.status(422).json(
      new ApiResponse(422, "Content Can't be blank!")
    )
  }

  const todo = await Todo.create({
    content,
    user: req.user?._id
  })

  if(!todo){
    return res.status(500).json(
      new ApiResponse(500, "Something went wrong while creating the Todo!")
    )
  }

  return res.status(200).json(
    new ApiResponse(200, "Todo Created Successfully!", todo)
  )
})

const updateTodo = asyncHandler( async (req, res) => {
  const todoId = req.params.todoId
  const { content, isCompleted } = req.body;

  if(!content){
    return res.status(422).json(
      new ApiResponse(422, "Content Can't be blank!")
    )
  }

  const todo = await Todo.findById(todoId)

  if(!todo.user.equals(req.user._id)){
    return res.status(422).json(
      new ApiResponse(422, "You can only update your todo!")
    )
  }

  const updatedTodo = await Todo.findByIdAndUpdate(todoId, { $set: { content: content, isCompleted: isCompleted }}, { new: true })

  if(!updatedTodo){
    return res.status(500).json(
      new ApiResponse(500, "Something went wrong while updating the Todo!")
    )
  }

  return res.status(200).json(
    new ApiResponse(200, "Todo Updated Successfully!")
  )

})

const deleteTodo = asyncHandler( async (req, res) => {
  const todoId = req.params.todoId
  const todo = await Todo.findById(todoId)
  const deletedTodo = await todo.deleteOne();

  console.log(deletedTodo);

  if(!deletedTodo){
    return res.status(500).json(
      new ApiResponse(500, "Something went wrong while deleting the Todo!")
    )
  }

  return res.status(200).json(
    new ApiResponse(200, "Todo Deleted Successfully!")
  )
})

export { getTodos, updateTodo, deleteTodo, createTodo }