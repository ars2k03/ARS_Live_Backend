import express, { type Application } from "express";
import { connectusersDB } from "./database/user.chat.js";
import router from "./router/route.js";
import http from "http";
import { initializeSocket } from "./socket/socket.io.js";
import cors from 'cors';
import { connectAuthUserDB } from "./database/user.auth.js";

const app : Application = express();
const port = 8000;

const socketServer = http.createServer(app);

initializeSocket(socketServer);

await connectusersDB();

await connectAuthUserDB();

app.use(express.json());

app.use(cors());

app.use('/', router);

socketServer.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on ${port}`);
})