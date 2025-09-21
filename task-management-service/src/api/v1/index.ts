import { Router } from 'express';
import authRouter from './routes/auth';
import taskRouter from './routes/tasks';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

router.use('/auth', authRouter);
router.use('/tasks', authMiddleware, taskRouter);

export default router;
