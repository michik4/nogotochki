import { Request, Response } from 'express';
import { AppDataSource } from '../config/typeorm';
import { Booking, BookingStatus } from '../entities/Booking';
import { Design } from '../entities/Design';
import { Master } from '../entities/Master';
import { Client } from '../entities/Client';
import { User } from '../entities/User';
import { MasterDesign } from '../entities/MasterDesign';
import { Notification, NotificationType } from '../entities/Notification';

export class BookingController {
  private bookingRepository = AppDataSource.getRepository(Booking);
  private designRepository = AppDataSource.getRepository(Design);
  private masterRepository = AppDataSource.getRepository(Master);
  private clientRepository = AppDataSource.getRepository(Client);
  private userRepository = AppDataSource.getRepository(User);
  private masterDesignRepository = AppDataSource.getRepository(MasterDesign);
  private notificationRepository = AppDataSource.getRepository(Notification);

  /**
   * @swagger
   * /bookings:
   *   post:
   *     summary: Создание бронирования
   *     description: Создание новой записи к мастеру на выполнение дизайна
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BookingCreateRequest'
   *     responses:
   *       201:
   *         description: Бронирование создано успешно
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Booking'
   *       400:
   *         description: Некорректные данные или мастер не может выполнить дизайн
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Необходима авторизация
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Дизайн или мастер не найден
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Внутренняя ошибка сервера
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async createBooking(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const {
        designId,
        masterId,
        scheduledAt,
        durationMinutes,
        notes
      } = req.body;

      // Валидация обязательных полей
      if (!designId) {
        return res.status(400).json({ error: 'ID дизайна обязателен' });
      }

      if (!masterId) {
        return res.status(400).json({ error: 'ID мастера обязателен' });
      }

      if (!scheduledAt) {
        return res.status(400).json({ error: 'Дата и время записи обязательны' });
      }

      // Валидация и парсинг даты
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ error: 'Некорректный формат даты и времени' });
      }

      // Проверяем, что дата не в прошлом
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ error: 'Дата записи не может быть в прошлом' });
      }

      // Проверяем пользователя и создаем клиента если нужно
      let user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['client']
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Если у пользователя нет профиля клиента, создаем его
      if (!user.client) {
        const client = this.clientRepository.create({
          userId: userId
        });
        await this.clientRepository.save(client);
        user.client = client;
      }

      // Проверяем дизайн
      const design = await this.designRepository.findOne({ where: { id: designId } });
      if (!design) {
        return res.status(404).json({ error: 'Дизайн не найден' });
      }

      // Проверяем мастера
      const master = await this.masterRepository.findOne({
        where: { id: masterId },
        relations: ['user']
      });
      if (!master) {
        return res.status(404).json({ error: 'Мастер не найден' });
      }

      // Проверяем, может ли мастер выполнить этот дизайн
      const masterDesign = await this.masterDesignRepository.findOne({
        where: { designId, masterId, isAvailable: true }
      });

      if (!masterDesign) {
        return res.status(400).json({ error: 'Мастер не может выполнить этот дизайн' });
      }

      // Создаем бронирование
      const booking = this.bookingRepository.create({
        clientId: user.client.id,
        masterId,
        designId,
        scheduledAt: scheduledDate,
        durationMinutes: durationMinutes || masterDesign.durationMinutes || 60,
        price: masterDesign.price,
        notes,
        status: BookingStatus.PENDING,
        responseDeadline: new Date(Date.now() + 5 * 60 * 1000) // 5 минут на ответ
      });

      const savedBooking = await this.bookingRepository.save(booking);

      // Создаем уведомление для мастера
      const notification = this.notificationRepository.create({
        userId: master.userId,
        type: NotificationType.BOOKING_REQUEST,
        title: 'Новая заявка на запись',
        message: `Клиент ${user.name} хочет записаться на ${design.title}`,
        data: {
          bookingId: savedBooking.id,
          designId,
          clientName: user.name,
          scheduledAt: scheduledDate.toISOString()
        }
      });

      await this.notificationRepository.save(notification);

      return res.status(201).json({
        success: true,
        message: 'Бронирование создано успешно',
        data: savedBooking
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      return res.status(500).json({ error: 'Ошибка создания бронирования' });
    }
  }

  /**
   * @swagger
   * /bookings/{id}/confirm:
   *   post:
   *     summary: Подтверждение бронирования
   *     description: Мастер подтверждает бронирование
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID бронирования
   *     responses:
   *       200:
   *         description: Бронирование подтверждено
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Booking'
   *       400:
   *         description: Бронирование уже обработано
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Необходима авторизация
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Только мастер может подтвердить бронирование
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Бронирование не найдено
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Внутренняя ошибка сервера
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async confirmBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['master', 'master.user', 'client', 'client.user', 'design']
      });

      if (!booking) {
        return res.status(404).json({ error: 'Бронирование не найдено' });
      }

      // Проверяем права
      if (booking.master.userId !== userId) {
        return res.status(403).json({ error: 'Только мастер может подтвердить бронирование' });
      }

      if (booking.status !== BookingStatus.PENDING) {
        return res.status(400).json({ error: 'Бронирование уже обработано' });
      }

      // Подтверждаем бронирование
      booking.status = BookingStatus.CONFIRMED;
      booking.confirmedAt = new Date();
      await this.bookingRepository.save(booking);

      // Обновляем время последнего ответа мастера
      await this.masterRepository.update(booking.masterId, {
        lastResponseAt: new Date()
      });

      return res.json(booking);
    } catch (error) {
      console.error('Error confirming booking:', error);
      return res.status(500).json({ error: 'Ошибка подтверждения бронирования' });
    }
  }

  /**
   * @swagger
   * /bookings/{id}/reject:
   *   post:
   *     summary: Отклонение или перенос бронирования
   *     description: Мастер отклоняет бронирование или предлагает альтернативное время
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID бронирования
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               alternativeTime:
   *                 type: string
   *                 format: date-time
   *                 description: Альтернативное время (если предлагается перенос)
   *               reason:
   *                 type: string
   *                 description: Причина отклонения
   *     responses:
   *       200:
   *         description: Бронирование отклонено или предложено альтернативное время
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Booking'
   *       400:
   *         description: Бронирование уже обработано
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Необходима авторизация
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Только мастер может отклонить бронирование
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Бронирование не найдено
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Внутренняя ошибка сервера
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async rejectOrRescheduleBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { alternativeTime, reason } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['master', 'master.user', 'client', 'client.user', 'design']
      });

      if (!booking) {
        return res.status(404).json({ error: 'Бронирование не найдено' });
      }

      // Проверяем права
      if (booking.master.userId !== userId) {
        return res.status(403).json({ error: 'Только мастер может отклонить бронирование' });
      }

      if (booking.status !== BookingStatus.PENDING) {
        return res.status(400).json({ error: 'Бронирование уже обработано' });
      }

      // Обновляем время последнего ответа мастера
      await this.masterRepository.update(booking.masterId, {
        lastResponseAt: new Date()
      });

      let notificationMessage = '';
      let notificationTitle = '';

      if (alternativeTime) {
        // Предлагаем альтернативное время
        booking.alternativeTimeProposed = new Date(alternativeTime);
        booking.status = BookingStatus.PENDING; // Остается в ожидании ответа клиента
        notificationTitle = 'Предложено другое время';
        notificationMessage = `Мастер ${booking.master.user.name} предложил другое время: ${new Date(alternativeTime).toLocaleString()}`;
      } else {
        // Отклоняем
        booking.status = BookingStatus.REJECTED;
        booking.cancellationReason = reason;
        notificationTitle = 'Запись отклонена';
        notificationMessage = `Мастер ${booking.master.user.name} отклонил вашу запись${reason ? `: ${reason}` : ''}`;
      }

      await this.bookingRepository.save(booking);

      // Уведомляем клиента
      const notification = this.notificationRepository.create({
        userId: booking.client.userId,
        type: alternativeTime ? NotificationType.BOOKING_REQUEST : NotificationType.BOOKING_REJECTED,
        title: notificationTitle,
        message: notificationMessage,
        data: {
          bookingId: booking.id,
          masterName: booking.master.user.name,
          alternativeTime: alternativeTime || null,
          reason: reason || null
        }
      });

      await this.notificationRepository.save(notification);

      return res.json(booking);
    } catch (error) {
      console.error('Error rejecting/rescheduling booking:', error);
      return res.status(500).json({ error: 'Ошибка обработки бронирования' });
    }
  }

  // Получение бронирований пользователя
  /**
   * @swagger
   * /bookings/me:
   *   get:
   *     summary: Получение бронирований текущего пользователя
   *     description: Получение списка бронирований для клиента или мастера
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, confirmed, rejected, completed, cancelled]
   *         description: Фильтр по статусу
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Номер страницы
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Количество элементов на странице
   *     responses:
   *       200:
   *         description: Список бронирований получен успешно
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 bookings:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Booking'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     pages:
   *                       type: integer
   *       401:
   *         description: Необходима авторизация
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Внутренняя ошибка сервера
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getUserBookings(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const { status, page = 1, limit = 20 } = req.query;

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['client', 'master']
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      let queryBuilder = this.bookingRepository.createQueryBuilder('booking');

      if (user.client) {
        // Бронирования клиента
        queryBuilder = queryBuilder
          .leftJoinAndSelect('booking.master', 'master')
          .leftJoinAndSelect('master.user', 'masterUser')
          .leftJoinAndSelect('booking.design', 'design')
          .where('booking.clientId = :clientId', { clientId: user.client.id });
      } else if (user.master) {
        // Бронирования мастера
        queryBuilder = queryBuilder
          .leftJoinAndSelect('booking.client', 'client')
          .leftJoinAndSelect('client.user', 'clientUser')
          .leftJoinAndSelect('booking.design', 'design')
          .where('booking.masterId = :masterId', { masterId: user.master.id });
      } else {
        return res.json({ bookings: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
      }

      if (status) {
        queryBuilder = queryBuilder.andWhere('booking.status = :status', { status });
      }

      queryBuilder = queryBuilder.orderBy('booking.scheduledAt', 'DESC');

      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(skip).take(Number(limit));

      const [bookings, total] = await queryBuilder.getManyAndCount();

      return res.json({
        bookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return res.status(500).json({ error: 'Ошибка получения бронирований' });
    }
  }

  // Отмена бронирования
  /**
   * @swagger
   * /bookings/{id}/cancel:
   *   post:
   *     summary: Отмена бронирования
   *     description: Клиент или мастер отменяет бронирование
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID бронирования
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *                 description: Причина отмены
   *     responses:
   *       200:
   *         description: Бронирование отменено успешно
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Booking'
   *       400:
   *         description: Бронирование уже отменено или завершено
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Необходима авторизация
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Нет прав для отмены бронирования
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Бронирование не найдено
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Внутренняя ошибка сервера
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async cancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { reason } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['master', 'master.user', 'client', 'client.user', 'design']
      });

      if (!booking) {
        return res.status(404).json({ error: 'Бронирование не найдено' });
      }

      // Проверяем права (клиент или мастер могут отменить)
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['client', 'master']
      });

      const canCancel = (user?.client?.id === booking.clientId) || 
                       (user?.master?.id === booking.masterId) ||
                       (user?.type === 'admin');

      if (!canCancel) {
        return res.status(403).json({ error: 'Нет прав для отмены бронирования' });
      }

      if (booking.status === BookingStatus.CANCELLED) {
        return res.status(400).json({ error: 'Бронирование уже отменено' });
      }

      if (booking.status === BookingStatus.COMPLETED) {
        return res.status(400).json({ error: 'Нельзя отменить завершенное бронирование' });
      }

      // Отменяем бронирование
      booking.status = BookingStatus.CANCELLED;
      booking.cancellationReason = reason;
      await this.bookingRepository.save(booking);

      // Уведомляем другую сторону
      const isClientCancelling = user?.client?.id === booking.clientId;
      const notificationUserId = isClientCancelling ? booking.master.userId : booking.client.userId;
      const cancellerName = isClientCancelling ? booking.client.user.name : booking.master.user.name;

      const notification = this.notificationRepository.create({
        userId: notificationUserId,
        type: NotificationType.BOOKING_CANCELLED,
        title: 'Запись отменена',
        message: `${cancellerName} отменил запись на ${booking.design?.title || 'услугу'}${reason ? `: ${reason}` : ''}`,
        data: {
          bookingId: booking.id,
          cancellerName,
          reason: reason || null
        }
      });

      await this.notificationRepository.save(notification);

      return res.json(booking);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return res.status(500).json({ error: 'Ошибка отмены бронирования' });
    }
  }

  // Завершение бронирования
  /**
   * @swagger
   * /bookings/{id}/complete:
   *   post:
   *     summary: Завершение бронирования
   *     description: Мастер отмечает бронирование как завершенное
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID бронирования
   *     responses:
   *       200:
   *         description: Бронирование завершено успешно
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Booking'
   *       400:
   *         description: Можно завершить только подтвержденное бронирование
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Необходима авторизация
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Только мастер может завершить бронирование
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Бронирование не найдено
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Внутренняя ошибка сервера
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async completeBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['master', 'master.user']
      });

      if (!booking) {
        return res.status(404).json({ error: 'Бронирование не найдено' });
      }

      // Только мастер может завершить бронирование
      if (booking.master.userId !== userId) {
        return res.status(403).json({ error: 'Только мастер может завершить бронирование' });
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        return res.status(400).json({ error: 'Можно завершить только подтвержденное бронирование' });
      }

      // Завершаем бронирование
      booking.status = BookingStatus.COMPLETED;
      booking.completedAt = new Date();
      await this.bookingRepository.save(booking);

      return res.json(booking);
    } catch (error) {
      console.error('Error completing booking:', error);
      return res.status(500).json({ error: 'Ошибка завершения бронирования' });
    }
  }
} 

// 87544893-c1a1-4ec9-84a0-9ef478d0ceb0