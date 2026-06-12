import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

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

    socket.on("call-user", (data) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);

      if (!receiverSocketId) {
        socket.emit("user-offline", {
          receiverId: data.receiverId,
        });
        return;
      }

      io.to(receiverSocketId).emit("incoming-call", {
        callerId: data.callerId,
        callerName: data.callerName,
        callerPicture: data.callerPicture,
      });
    });

    socket.on("answer-call", (data) => {
      const callerSocketId = onlineUsers.get(data.callerId);
      if (!callerSocketId) return;

      io.to(callerSocketId).emit("call-accepted", {
        receiverId: data.receiverId,
      });
    });

    // Either side (caller or receiver) can reject before the call connects.
    // We notify both possible parties so whichever side is still waiting
    // closes its CallScreen.
    socket.on("reject-call", (data) => {
      const callerSocketId = onlineUsers.get(data.callerId);
      const receiverSocketId = onlineUsers.get(data.receiverId);

      if (callerSocketId) {
        io.to(callerSocketId).emit("call-rejected", {
          receiverId: data.receiverId,
        });
      }
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call-rejected", {
          receiverId: data.receiverId,
        });
      }
    });

    // Used to hang up an ALREADY-CONNECTED call. Notifies the other party.
    socket.on("end-call", (data) => {
      const otherSocketId = onlineUsers.get(data.receiverId);
      if (!otherSocketId) return;

      io.to(otherSocketId).emit("call-ended", {
        from: data.callerId,
      });
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User Removed: ${userId}`);
          break;
        }
      }
      console.log("User Disconnected:", socket.id);
    });
  });

  return io;
};