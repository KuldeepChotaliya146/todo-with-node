import app from "./app.js";
import connectDB from "./db/connect.js";
import dotenv from "dotenv";

dotenv.config({
  path: './.env'
})

connectDB()
.then(() => {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log("Server listing on PORT:", port);
  })

  app.get('/', (req, res) => {
    res.send('Welcome to Todo App!')
  })
}
)
.catch((error) => {
  console.log("DB connection error", error.message);
})