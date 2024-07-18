import * as path from "path";
import * as dotenv from "dotenv";
import { initServer } from "./app";
import { connectDb } from "./db";
import { connectRedis } from "./redis";

dotenv.config({ path: path.join(__dirname, ".env") });

(async () => {
  Promise.all([connectRedis(), connectDb()]).then(() => initServer());
})();
