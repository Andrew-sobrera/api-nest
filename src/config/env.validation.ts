import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),
  BCRYPT_SALT_ROUNDS: Joi.number().min(4).max(15).default(10),
  SEED_ADMIN_EMAIL: Joi.string()
    .email({ tlds: { allow: false } })
    .default('admin@orders.local'),
  SEED_ADMIN_PASSWORD: Joi.string().min(8).default('Admin@123456'),
  SEED_ADMIN_NAME: Joi.string().default('System Administrator'),
  CORS_ORIGIN: Joi.string().default('*'),
});
