import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const response = await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`)
    console.log("DB Connected!", response.connection.host);
  } catch (error) {
    console.log("DB connection failed!", error.message);
    process.exit(1)
  }
}

export default connectDB;