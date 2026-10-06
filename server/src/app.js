import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import sanitize from './middleware/sanitize.js';
import requestTiming from './middleware/requestTiming.js';
import { apiLimiter } from './middleware/rateLimit.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { sendSuccess } from './utils/apiResponse.js';
import routes from './routes.js';

const app = express();

// Behind Vercel's proxy (one hop: it sets X-Forwarded-For to the visitor's IP) so rate limiting sees the real IP.
if (env.isProd) app.set('trust proxy', env.TRUST_PROXY);

app.use(helmet());
app.use(
  cors({
    // Browsers forbid `Access-Control-Allow-Origin: *` with credentials, so only allowlisted
    // origins are reflected. Requests without an Origin (curl, server-to-server) are allowed.
    origin: (origin, cb) => cb(null, !origin || env.corsOrigins.includes(origin)),
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(sanitize);

// Dev: short colored lines. Prod: structured request logs (method, path, status, duration) via winston.
if (env.isDev) app.use(morgan('dev'));
else app.use(requestTiming);

app.get('/', (req, res) => sendSuccess(res, null, 'Portfolio API is up and running'));

app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
