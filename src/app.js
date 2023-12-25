import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();

// To handle CORS related issues
app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true
}))

app.use(express.json({ limit: '20kb'})) // To define size of json which can expect from client
app.use(express.urlencoded({ extended: true, limit: "16kb" })) // To deal with query parameters
app.use(express.static("public")) // To handle static assets
app.use(cookieParser()) // To set and get cookies from client

// routes
import userRouter from "./routes/user.routes.js"
import todoRouter from "./routes/todo.routes.js"

app.use('/api/v1/users', userRouter)
app.use('/api/v1/todos', todoRouter)

export default app;