import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { userHistory } from "../models/user.model.js";

const onlineUsers = new Map<string, string>();

export const initializeSocket = ( server: HttpServer ) => {

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    socket.on("register", (userId : string) => {

        onlineUsers.set(userId, socket.id);

        console.log(
            `User Registered: ${userId} -> ${socket.id}`
        );

    });

    socket.on("send_message", async (data) => {

      const { senderId, receiverId, message} = data;

      let chat = await userHistory.findOne({
        participants: {
          $all: [senderId, receiverId],
        },
      });

      if (!chat) {

        chat = await userHistory.create({

          participants: [
            senderId,
            receiverId,
          ],

          messages: [],

        });

      }

      chat.messages.push({
        senderId,
        message,
      });

      await chat.save();

      const receiverSocketId = onlineUsers.get(receiverId);

      const savedMessage = chat.messages[ chat.messages.length - 1 ];

      console.log(savedMessage);

      if (receiverSocketId) {

        io.to(receiverSocketId).emit( "receive_message", savedMessage);

      } else {

        console.log("RECEIVER NOT FOUND");

      }

    });

    socket.on("disconnect", () => {

      for (const [userId, socketId] of onlineUsers.entries()) {

        if (socketId === socket.id) {

          onlineUsers.delete(userId);

          console.log( `User Removed: ${userId}`);

          break;
        }

      }

      console.log( "User Disconnected:", socket.id);

    });

  });

  return io;
};