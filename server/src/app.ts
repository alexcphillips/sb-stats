import express from "express";
import { appConfig } from "../app.config";
import { cleanupDb } from "./db";
import { apiLogger } from "./routes/middleware";
import routes from "./routes";

process.on("SIGINT", cleanupDb);
process.on("SIGTERM", cleanupDb);

const app = express();
app.use(express.json());

app.use(apiLogger);
app.use(routes);

export const initServer = (): void => {
  app.listen(appConfig.server.port, () => console.log(`Server listening on port: ${appConfig.server.port}`));
};
