import { Pool } from "pg";
import logger from "../logger"; // Adjust the path to your logger

const seed = async (pool: Pool) => {
  try {
    await pool.query(`DROP TABLE IF EXISTS users`);
    logger.info("Dropped users table if it existed");

    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info("Recreated users table");

    // Insert seed data
    const userData = [
      { name: "John Doe", email: "john@example.com", password: "password123" },
      { name: "Jane Smith", email: "jane@example.com", password: "password123" },
      { name: "Alice Johnson", email: "alice@example.com", password: "password123" },
    ];

    for (const user of userData) {
      await pool.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [user.name, user.email, user.password]);
    }

    logger.info("User data seeded successfully");
  } catch (err) {
    logger.error("Error during seeding:", err);
  }
};

export default seed;
