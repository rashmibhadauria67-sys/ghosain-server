import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/post.js";
import friendRoutes from "./routes/friend.js";
import chatRoutes from "./routes/chat.js";
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST", "PUT"] }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);      // Signup/Login
app.use("/api/posts", postRoutes);     // Posts + Likes + Voice comments
app.use("/api/friends", friendRoutes); // Friend requests
app.use("/api/chat", chatRoutes);      // Chat history + send
app.use("/api/user", userRoutes);      // Ghost mode + profile

// Live Chat (Socket.io)
io.on("connection", (socket) => {
    // Join personal room for userId to get direct messages
    socket.on("join", (userId) => {
        socket.join(userId);
    });

    // Send real-time message
    socket.on("send_message", (payload) => {
        const { sender, receiver, text, voice } = payload;
        // Emit to receiver's room
        io.to(receiver).emit("receive_message", { sender, receiver, text, voice, createdAt: new Date().toISOString() });
    });

    socket.on("disconnect", () => {
        // Optional: handle user disconnect
    });
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        httpServer.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error(err));