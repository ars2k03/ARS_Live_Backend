import express, { type Request, type Response } from "express";
import { authMiddleWare } from "../middleware/auth.middle.js";
import { googleLogin } from "../log/google.js";
import { refreshAccessToken } from "../log/refreshToken.js";
import pool from "../database/user.auth.js";
import { sendOtp } from "../controller/otp.send.js";
import { verifyOtp } from "../controller/otp.verify.js";
import { openConversation } from "../controller/chat/openConversation.js";

const router = express.Router();

router.post("/google-login", googleLogin);

router.post("/refresh", refreshAccessToken);

router.post("/send-otp", authMiddleWare, sendOtp);

router.post("/verify-otp", authMiddleWare, verifyOtp);

router.get("/profile", authMiddleWare, (req : Request, res : Response) => {

    const user = (req as any).user;

    return res.status(200).json({
      message: "Welcome to profile",
      user,
    });

  }
);

router.post( "/chat/open", authMiddleWare, openConversation);


router.get( "/users", authMiddleWare, async (req, res) => {

    const currentUser = (req as any).user;

    const usersQuery = `
      SELECT *
      FROM userinfo
      WHERE id != $1
    `;

    const users = await pool.query(usersQuery, [currentUser.id]);

    return res.status(200).json({
      users: users.rows
    });

  }
);

export default router;