import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, errors } = format;

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }), // ISO format
    printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} ${level}: ${stack || message}`;
    })
  ),
  transports: [new transports.Console(), new transports.File({ filename: "app.log" })],
});

export default logger;
