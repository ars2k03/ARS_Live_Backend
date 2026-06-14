import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import pool from "../database/user.auth.js";
import dotenv from "dotenv";
dotenv.config();

const client = new OAuth2Client();

type User = {
  id : string,
  name : string,
  email : string,
  avatar_url : string
}

export const googleLogin = async ( req: Request, res: Response ) => {

  try {
    
    const { idToken } = req.body;

    let user : User;

    if (!idToken) {

      return res.status(400).json({
        message: "Google token missing",
      });

    }

    const ticket = await client.verifyIdToken({idToken});

    const payload = ticket.getPayload();

    if (!payload) {

      return res.status(401).json({
        message: "Invalid Google token",
      });

    }

    const findUserQuery = `
      SELECT * FROM userinfo
      WHERE email = $1
    `;

    const existingUser = await pool.query( findUserQuery, [payload.email]);
    
    if(existingUser.rows.length === 0){
      
      const query = `
        INSERT INTO userinfo(name, email, avatar_url)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const values = [payload.name, payload.email, payload.picture];

      const result = await pool.query(query, values);

      user = result.rows[0];

    } else {

      user = existingUser.rows[0];

    }

    const token = jwt.sign(

      {
        id: user.id
      },

      process.env.JWT_SECRET!,

      {
        expiresIn: "7d",
      }

    );

    const refreshToken = jwt.sign(
        {
            id : user.id
        },
        
        process.env.JWT_REFRESH_SECRET!,

        {
            expiresIn : "30d"
        }
    );

    return res.status(200).json({

        message: "Google login successful",
        token,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.avatar_url,
        },

    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Google login failed",
    });

  }

};