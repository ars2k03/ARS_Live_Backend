import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const usersDB = mongoose.createConnection();

export const connectusersDB = async () => {
  try {
    
    await usersDB.openUri(

      process.env.MONGO_DB as string,
      {
        dbName: "users",
      }
    );

    console.log("✅ Database Connected");

  } catch (error) {

    console.error("❌ Database Connection Failed:", error);
    process.exit(1);

  }
};