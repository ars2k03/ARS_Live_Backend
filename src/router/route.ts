import express, { type Request, type Response } from "express";
import { authMiddleWare } from "../middleware/auth.middle.js";
import { googleLogin } from "../log/google.js";
import { refreshAccessToken } from "../log/refreshToken.js";
import pool from "../database/user.auth.js";
import { userHistory } from "../models/user.model.js";

const router = express.Router();

router.post("/google-login", googleLogin);

router.post("/refresh", refreshAccessToken);

router.get("/profile", authMiddleWare, (req : Request, res : Response) => {

    const user = (req as any).user;

    return res.status(200).json({
      message: "Welcome to profile",
      user,
    });

  }
);

router.get( "/messages/:receiverId", authMiddleWare,
  async (req, res) => {

    const currentUser = (req as any).user;

    const receiverId = req.params.receiverId;

    const chat = await userHistory.findOne({
      participants : {
        $all : [
          currentUser.id,
          receiverId,
        ]
      }
    });

    return res.status(200).json({
      success: true,
      messages : chat?.messages ?? [],
    });

  }
);

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