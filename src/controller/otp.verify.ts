import type { Request, Response } from "express";
import { redis } from "../database/auth.redis.js";
import pool from "../database/user.auth.js";

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP required",
      });
    }

    const savedOtp = await redis.get(
      `otp:${phoneNumber}`
    );

    if (!savedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (savedOtp !== Number(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await redis.del(`otp:${phoneNumber}`);

    const user = (req as any).user;

    const updateQuery = `
    UPDATE userinfo
    SET phone_number = $1
    WHERE id = $2
    `

    await pool.query(updateQuery, [phoneNumber, user.id]);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: "server error",
    });

  }
};