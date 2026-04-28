import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from './config/passport';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import gameRoutes from './routes/game.routes';
import oauthRoutes from './routes/oauth.routes';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/AppError';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDatabase();

app.use(helmet());

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:3000',
    credentials: true
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(passport.initialize());

app.use(mongoSanitize());

app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    success: true,
    message: 'Fazn Ultra API',
    version: '1.0.0'
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/oauth', oauthRoutes);

app.all('*', (req: Request, _res: Response, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
