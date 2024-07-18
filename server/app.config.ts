type ServerConfig = {
  port: number;
};

type DbConfig = {
  user: string;
  password: string;
  port: number;
  seed: boolean;
  connectionTimeoutMillis: number;
  query_timeout: number;
  database: string;
};

type CacheConfig = {
  username: string;
  password: string;
  host: string;
  port: number;
  resetOnStartup: boolean;
};

type AppConfig = {
  server: ServerConfig;
  db: DbConfig;
  cache: CacheConfig;
};

const dynamicConfig: AppConfig = {
  server: {
    port: Number(process.env.SERVER_PORT),
  },
  db: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    seed: !!process.env.DB_SEED,
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS),
    query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS),
    database: process.env.DB_NAME,
  },
  cache: {
    username: process.env.CACHE_USERNAME,
    password: process.env.CACHE_PASSWORD,
    host: process.env.CACHE_HOST,
    port: Number(process.env.CACHE_PORT),
    resetOnStartup: !!process.env.RESET_ON_STARTUP,
  },
} as const;

const localConfig: AppConfig = {
  server: {
    port: 3000,
  },
  db: {
    user: "postgres",
    password: "HHockey121",
    port: 5432,
    seed: true,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
    database: "postgres",
  },
  cache: {
    username: "",
    password: "",
    host: "",
    port: 6379,
    resetOnStartup: true,
  },
} as const;

export const appConfig = process.env.NODE_ENV === "prod" ? dynamicConfig : localConfig;
