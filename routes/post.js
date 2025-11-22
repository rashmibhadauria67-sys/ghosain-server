import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();

// Create Post
router.post("/", async (req, res) => {
    try {
        const { user, caption, image } = req.body;
        const newPost = new Post({ user, caption, image });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Feed (filters ghostMode users for a cleaner experience)
router.get("/", async (req, res) => {
    try {
        const ghostUsers = await User.find({ ghostMode: true }).select("_id");
        const ghostIds = ghostUsers.map(u => u._id);

        const posts = await Post.find({ user: { $nin: ghostIds } })
            .populate("user", "username email ghostMode")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like a Post
router.put("/:id/like", async (req, res) => {
    try {
        const { user } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (!post.likes.includes(user)) {
            post.likes.push(user);
            await post.save();
            return res.json({ message: "Post liked" });
        }
        res.json({ message: "Already liked" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Comment (Text or Voice)
router.post("/:id/comment", async (req, res) => {
    try {
        const { user, text, voice } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.comments.push({ user, text: text || null, voice: voice || null });
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;