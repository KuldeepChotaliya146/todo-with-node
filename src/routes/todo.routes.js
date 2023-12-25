import { Router } from "express";
import VerifyJWT from "../middlewares/auth.middleware.js";
import { createTodo, deleteTodo, getTodos, updateTodo } from "../controllers/todo.controller.js";

const router = Router();

router.route('/').get(VerifyJWT, getTodos)
router.route('/').post(VerifyJWT, createTodo)
router.route('/:todoId').patch(VerifyJWT, updateTodo)
router.route('/:todoId').delete(VerifyJWT, deleteTodo)

export default router;