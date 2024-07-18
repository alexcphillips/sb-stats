import express from "express";
import * as sb from "../sb";
import { pool } from "../db";
import logger from "../logger";

const router = express.Router();

router.get(["/", "/health", "/uptime"], (req, res) => res.status(200).send({ uptime: process.uptime() }));
// router.use(keyChecker); // stuff below requires api key
// router.use(auth) // stuff below requires auth

router.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    return res.status(200).json(result.rows);
  } catch (err) {
    logger.error("Error fetching users:", err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
