import mongoose from "mongoose";
import { usersDB } from "../database/user.chat.js";

const historySchema = new mongoose.Schema({

  participants: {
    type: [String],
    required: true,
  },

  messages: [
    {
      senderId: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],

}, {
  timestamps: true,
});

export const userHistory = usersDB.model( "chathistories", historySchema);