import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { Conversation } from "../model/conversation.model.js";

const onlineUsers = new Map<string, string>();

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("register", (userId: string) => {

      onlineUsers.set(userId, socket.id);

      console.log(`User Registered: ${userId} -> ${socket.id}`);
      
    });

    socket.on("send-message", async (data) => {
      try {
        const { conversationId, senderId, receiverId, text } = data;

        const newMessage = {
          senderId,
          text,
          seen: false,
          createdAt: new Date(),
        };

        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            $push: { messages: newMessage },
            $set: { updatedAt: new Date() },
          }
        );

        const receiverSocketId = onlineUsers.get(receiverId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new-message", {
            conversationId,
            message: newMessage,
          });
        }

        socket.emit("message-sent", {
          conversationId,
          message: newMessage,
        });
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("mark-seen", async ({ conversationId, userId }) => {
      try {
        await Conversation.updateOne(
          { _id: conversationId },
          { $set: { "messages.$[msg].seen": true } },
          {
            arrayFilters: [
              { "msg.senderId": { $ne: userId }, "msg.seen": false },
            ],
          }
        );

        io.emit("messages-seen", {
          conversationId,
          seenBy: userId,
        });
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("disconnect", () => {

      const userId = socket.data.userId;

      if (!userId) return;

      const currentSocketId = onlineUsers.get(userId);

      if (currentSocketId === socket.id) {

        onlineUsers.delete(userId);
        
      }

      console.log(`User Removed: ${userId}`);
    });
  });

  return io;
};