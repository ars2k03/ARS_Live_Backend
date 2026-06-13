import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
    },

    text: {
        type: String,
        required: true,
    },

    seen: {
        type: Boolean,
        default: false,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: String,
                required: true,
            },
        ],

        messages: [messageSchema],
    },

    {
        timestamps: true,
    }
);


export const Conversation = mongoose.model("Conversation", conversationSchema);