import { Router } from 'express';
import authRouter from './auth.routes';
import usersRouter from './users.routes';
import mastersRouter from './masters.routes';
import designsRouter from './designs.routes';
import bookingsRouter from './bookings.routes';
import adminRouter from './admin.routes';
import docRouter from './doc.routes';
import mediaRouter from './content.routes';

const apiRouter = Router();

// Документация API (должна быть первой для правильной работы)
apiRouter.use('/docs', docRouter);

// API маршруты согласно диаграмме
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/masters', mastersRouter);
apiRouter.use('/designs', designsRouter);
apiRouter.use('/bookings', bookingsRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/media', mediaRouter);

export default apiRouter; 