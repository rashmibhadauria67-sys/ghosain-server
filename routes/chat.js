import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// Send Message (text or voice) — respects ghost mode (sender can't show presence; we still allow sending)
router.post("/send", async (req, res) => {
    try {
        const { sender, receiver, text, voice } = req.body;

        const receiverUser = await User.findById(receiver);
        if (!receiverUser) return res.status(404).json({ message: "Receiver not found" });

        const newMessage = new Message({ sender, receiver, text, voice });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Chat History between two users
router.get("/:sender/:receiver", async (req, res) => {
    try {
        const { sender, receiver } = req.params;
        const messages = await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;