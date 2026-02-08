import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const BaseConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  APP_PORT: z.coerce.number().default(3000),
  APP_HOST: z.string().default('0.0.0.0'),
});

const DatabaseConfigSchema = z.object({
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string().default('berhot'),
  POSTGRES_PASSWORD: z.string().default('berhot_dev_password'),
  POSTGRES_DB: z.string().default('berhot_dev'),
  DATABASE_URL: z.string().optional(),
});

const RedisConfigSchema = z.object({
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),
});

const KafkaConfigSchema = z.object({
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: z.string().default('berhot-local'),
  KAFKA_GROUP_ID: z.string().optional(),
});

const AuthConfigSchema = z.object({
  JWT_SECRET: z.string().default('dev-secret-change-me'),
  JWT_ACCESS_TOKEN_TTL: z.coerce.number().default(900),
  JWT_REFRESH_TOKEN_TTL: z.coerce.number().default(604800),
});

export const AppConfigSchema = BaseConfigSchema
  .merge(DatabaseConfigSchema)
  .merge(RedisConfigSchema)
  .merge(KafkaConfigSchema)
  .merge(AuthConfigSchema);

export type AppConfig = z.infer<typeof AppConfigSchema>;

let _config: AppConfig | null = null;

export function loadConfig(overrides?: Partial<AppConfig>): AppConfig {
  const raw = { ...process.env, ...overrides };
  _config = AppConfigSchema.parse(raw);
  return _config;
}

export function getConfig(): AppConfig {
  if (!_config) {
    return loadConfig();
  }
  return _config;
}

export function isDevelopment(): boolean {
  return getConfig().NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return getConfig().NODE_ENV === 'production';
}

export function isTest(): boolean {
  return getConfig().NODE_ENV === 'test';
}
