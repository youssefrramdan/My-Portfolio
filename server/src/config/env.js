import { z } from 'zod';
import logger from './logger.js';

const required = (name) => z.string({ error: `${name} is required` }).trim().min(1, `${name} is required`);

const envSchema = z.object({
  // Vercel sets `VERCEL=1`; NODE_ENV is not set there (setting it would also skip the client's build tools).
  NODE_ENV: z.enum(['development', 'production', 'test']).default(process.env.VERCEL ? 'production' : 'development'),
  PORT: z.coerce.number().int().positive().default(5050),
  CLIENT_URL: z.url({ error: 'CLIENT_URL must be a valid URL (e.g. http://localhost:5173)' }),
  // Optional comma-separated allowlist (e.g. deployed frontend + preview URLs). Defaults to CLIENT_URL.
  CORS_ORIGIN: z.string().optional(),

  MONGODB_URI: required('MONGODB_URI').regex(/^mongodb(\+srv)?:\/\//, 'MONGODB_URI must start with mongodb:// or mongodb+srv://'),

  JWT_SECRET: required('JWT_SECRET').min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: required('JWT_EXPIRES_IN'),
  // `none` needs a secure (https) cookie, so only use it in production behind https.
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  // Proxy hops in front of the server in production (Vercel = 1), so rate limiting sees the visitor's IP.
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(1),

  // Only read by `npm run seed:admin`; the server itself runs without them.
  ADMIN_EMAIL: z.email({ error: 'ADMIN_EMAIL must be a valid email address' }).optional(),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be at least 8 characters').optional(),
  ADMIN_NAME: z.string().trim().optional(),
  ADMIN_TITLE: z.string().trim().optional(),

  CLOUDINARY_CLOUD_NAME: required('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: required('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: required('CLOUDINARY_API_SECRET'),
  // Root folder of every upload, so sites sharing one Cloudinary account never touch each other's files.
  CLOUDINARY_FOLDER: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'CLOUDINARY_FOLDER may only use lowercase letters, digits and dashes')
    .default('portfolio'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

// Empty values like `SMTP_HOST=` in .env should count as "not set".
const rawEnv = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => [key, value === '' ? undefined : value]),
);
// On Vercel the site and the API share the production domain, which Vercel provides.
rawEnv.CLIENT_URL ??= rawEnv.VERCEL_PROJECT_PRODUCTION_URL && `https://${rawEnv.VERCEL_PROJECT_PRODUCTION_URL}`;

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const lines = parsed.error.issues.map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`);
  logger.error(
    ['Invalid environment configuration. Fix these in server/.env (see server/.env.example):', ...lines].join('\n'),
  );
  process.exit(1);
}

const corsOrigins = (parsed.data.CORS_ORIGIN ?? parsed.data.CLIENT_URL)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = Object.freeze({
  ...parsed.data,
  corsOrigins,
  isProd: parsed.data.NODE_ENV === 'production',
  isDev: parsed.data.NODE_ENV === 'development',
});
