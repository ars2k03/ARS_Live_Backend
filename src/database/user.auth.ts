import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
    connectionString : process.env.AUTH_DB,
});

export const connectAuthUserDB = async () => {
    try {

        const result = await pool.query(
          "SELECT NOW()"
        );

        console.log(
          "🔥 Database Connected",
          result.rows[0]
        );

    } catch (error) {

        console.error(
          "❌ Database Connection Failed:",
          error
        );

        process.exit(1);

    }
}

export default pool;
