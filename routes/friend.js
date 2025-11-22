import express from "express";
import FriendRequest from "../models/FriendRequest.js";

const router = express.Router();

// Send Friend Request
router.post("/send", async (req, res) => {
    try {
        const { sender, receiver } = req.body;

        const existing = await FriendRequest.findOne({ sender, receiver, status: "pending" });
        if (existing) return res.status(400).json({ message: "Request already pending" });

        const request = new FriendRequest({ sender, receiver });
        await request.save();
        res.status(201).json({ message: "Friend request sent", request });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accept Friend Request
router.put("/:id/accept", async (req, res) => {
    try {
        const request = await FriendRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });
        request.status = "accepted";
        await request.save();
        res.json({ message: "Friend request accepted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reject Friend Request
router.put("/:id/reject", async (req, res) => {
    try {
        const request = await FriendRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });
        request.status = "rejected";
        await request.save();
        res.json({ message: "Friend request rejected" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List friends for a user (accepted requests)
router.get("/list/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const accepted = await FriendRequest.find({
            status: "accepted",
            $or: [{ sender: userId }, { receiver: userId }]
        }).populate("sender receiver", "username email");

        const friends = accepted.map(reqItem =>
            reqItem.sender._id.toString() === userId ? reqItem.receiver : reqItem.sender
        );

        res.json(friends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;