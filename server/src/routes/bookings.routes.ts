import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const bookingsRouter = Router();
const bookingController = new BookingController();

// POST /bookings - Создание новой записи
bookingsRouter.post('/', authenticateToken, bookingController.createBooking.bind(bookingController));

// GET /bookings/me - Получение записей текущего пользователя
bookingsRouter.get('/me', authenticateToken, bookingController.getUserBookings.bind(bookingController));

// POST /bookings/:id/confirm - Подтверждение записи
bookingsRouter.post('/:id/confirm', authenticateToken, bookingController.confirmBooking.bind(bookingController));

// POST /bookings/:id/reject - Отклонение или перенос записи
bookingsRouter.post('/:id/reject', authenticateToken, bookingController.rejectOrRescheduleBooking.bind(bookingController));

// POST /bookings/:id/cancel - Отмена записи
bookingsRouter.post('/:id/cancel', authenticateToken, bookingController.cancelBooking.bind(bookingController));

// POST /bookings/:id/complete - Завершение записи
bookingsRouter.post('/:id/complete', authenticateToken, bookingController.completeBooking.bind(bookingController));

export default bookingsRouter; 