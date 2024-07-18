import morgan, { StreamOptions } from "morgan";
import logger from "../../logger";

const stream: StreamOptions = {
  write: (message) => {
    logger.info(message.trim());
  },
};

const skip = () => {
  return process.env.NODE_ENV === "test";
};

const apiLogger = morgan("combined", { stream, skip });

export default apiLogger;
