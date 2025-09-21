
import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';

import apiV1Router from '@/api/v1/index';
import { errorHandler } from './middleware/error';

config();

const app: Application = express();
const PORT = process.env['PORT'] || 3000;

app.use(helmet());
app.use(
  cors({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:5173',
    credentials: true, // allow cookies
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'task-management-service',
  });
});

app.use('/api/v1', apiV1Router);

app.use('/{*any}', (_req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist',
  });
});

/* if request reaches this middleware - time to return an error */
app.use(errorHandler);

app.listen(PORT, (): void => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
});
