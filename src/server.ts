import express, { type Application } from "express";
import router from "./router/route.js";
import http from "http";
import { initializeSocket } from "./socket/socket.io.js";
import cors from 'cors';
import { connectAuthUserDB } from "./database/user.auth.js";
import { connectMongoDB } from "./database/user.mongo.js";

const app : Application = express();
const port = 8000;

const server = http.createServer(app);

initializeSocket(server);

await connectAuthUserDB();

await connectMongoDB();

app.use(express.json());

app.use(cors());

app.use('/', router);

server.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on ${port}`);
})