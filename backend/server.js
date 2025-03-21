import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.routes.js"
import userRoutes from "./routes/user.routes.js"


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));
app.use(postRoutes);
app.use(userRoutes);


const start = async() => {
    const connectDB = await mongoose.connect("mongodb+srv://sharmaalson:SocialMediaHoHai@socialmediaplatform.jjrbm.mongodb.net/?retryWrites=true&w=majority&appName=SocialMediaPlatform")

    app.listen(8080, () => {
        console.log("Server is running on port 8080");
    })
}

start();