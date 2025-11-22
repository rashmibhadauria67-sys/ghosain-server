import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: String,
    voice: String // 🎤 voice message (audio file URL)
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);