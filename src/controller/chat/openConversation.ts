import type { Request, Response } from "express";
import { Conversation } from "../../model/conversation.model.js";

export const openConversation = async ( req: Request, res: Response) => {
  try {

    const currentUser = (req as any).user;
    const currentUserId = currentUser.id;

    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [currentUserId, receiverId],
      },
    });

    if (!conversation) {

      conversation = await Conversation.create({
        participants: [
          currentUserId,
          receiverId,
        ],
        
        messages: [],

        createdAt : new Date(),
        updatedAt : new Date()
      });

    }

    return res.status(200).json({
      success: true,
      conversation,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};