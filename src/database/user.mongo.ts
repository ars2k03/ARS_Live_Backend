import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const client = new MongoClient(process.env.MONGO_DB as string);

export const connectMongoDB = async () => {
    try{

        await mongoose.connect(
            process.env.MONGO_DB as string,
            {
                dbName: "users"
            }
        );

        console.log("✅ MongoDB Connected");

        
    }catch(e){
        console.error("❌ MongoDB Connection Error:", e);

        process.exit(1);
    }
}