import { appConfig } from "../../app.config";
import { createClient, RedisClientOptions } from "redis";

export type RedisClientType = ReturnType<typeof createClient>;
export const redis: { cache: null | Record<string, any> | RedisClientType } = {
  cache: null,
};

export const connectRedis = async () => {
  try {
    const opts: RedisClientOptions = {
      username: appConfig.cache.username,
      password: appConfig.cache.password,
      socket: {
        host: appConfig.cache.host,
        port: Number(appConfig.cache.port),
      },
    };

    const redisClient: RedisClientType = await createClient(opts)
      .on("error", (err) => console.log("Redis Client Error:", err))
      .on("connect", () => console.debug("Redis Connected"))
      .on("reconnecting", () => console.log("Redis Reconnecting"))
      .on("end", () => console.debug("Redis Connection Closed"))
      .connect();

    redis.cache = redisClient;

    if (appConfig.cache.resetOnStartup) {
      redis.cache.flushAll().catch((err) => {
        console.error("Error flushing Redis cache:", err);
      });
    }
    return redisClient;
  } catch (err) {
    console.debug("Redis err:", err);
  }
};
