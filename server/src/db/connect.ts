import { Pool } from "pg";
import { appConfig } from "../../app.config";
import seed from "./seed";
import logger from "../logger";

const pool = new Pool(appConfig.db);

// Clean up the pool on process termination
export const cleanupDb = async () => {
  try {
    await pool.end();
    logger.info("Connection pool has ended");
  } catch (err) {
    logger.error("Error ending connection pool:", err);
  } finally {
    process.exit();
  }
};

export const connectDb = async (): Promise<void> => {
  try {
    await pool.connect();
    logger.info("Db Connected");
    if (appConfig.db.seed) {
      await seed(pool);
      logger.info("Seeding completed");
    }
  } catch (err) {
    logger.error("Error connecting to db:", err);
  }
};

export { pool };
