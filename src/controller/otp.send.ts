import type { Request, Response } from "express";
import dotenv from "dotenv";
import { redis } from "../database/auth.redis.js";
import pool from "../database/user.auth.js";
dotenv.config();

export const sendOtp = async ( req: Request,res: Response ) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    const searchquery = `
    SELECT id
    FROM userinfo
    WHERE phone_number = $1
    `;

    const result = await pool.query(
      searchquery,
      [phoneNumber]
    );

    if (result.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already in use",
      });
    }

    const otp = Math.floor( 100000 + Math.random() * 900000).toString();

    await redis.set(
        `otp:${phoneNumber}`,
        otp,
        {
            ex: 300,
        }
    );

    await fetch("https://whatsapp-ai-assistant-ee5w.onrender.com/send-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          otp
        }),
      }
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error: any) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });

  }
};