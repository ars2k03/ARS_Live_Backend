import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../database/user.auth.js";
dotenv.config();

export const authMiddleWare = async ( req: Request,res: Response, next: NextFunction )  => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const result = jwt.verify(
      token as string,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const findUserQuery = `
      SELECT * FROM userinfo
      WHERE id = $1
    `;

    const existingUser = await pool.query( findUserQuery, [result.id]);
    
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = existingUser.rows[0];

    (req as any).user = {
      id : user.id,
      name : user.name,
      email : user.email,
      picture : user.avatar_url
    };

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};