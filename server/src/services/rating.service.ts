import { AppDataSource } from '../config/typeorm';
import { Master } from '../entities/Master';
import { Booking, BookingStatus } from '../entities/Booking';
import { Notification, NotificationType } from '../entities/Notification';
import { User } from '../entities/User';

export class RatingService {
  private masterRepository = AppDataSource.getRepository(Master);
  private bookingRepository = AppDataSource.getRepository(Booking);
  private notificationRepository = AppDataSource.getRepository(Notification);
  private userRepository = AppDataSource.getRepository(User);

  // Проверка просроченных бронирований и снижение рейтинга
  async checkExpiredBookings() {
    try {
      const expiredBookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.master', 'master')
        .leftJoinAndSelect('master.user', 'user')
        .leftJoinAndSelect('booking.client', 'client')
        .leftJoinAndSelect('client.user', 'clientUser')
        .where('booking.status = :status', { status: BookingStatus.PENDING })
        .andWhere('booking.responseDeadline < :now', { now: new Date() })
        .andWhere('booking.isAutoRejected = :isAutoRejected', { isAutoRejected: false })
        .getMany();

      for (const booking of expiredBookings) {
        await this.handleExpiredBooking(booking);
      }

      console.log(`Обработано ${expiredBookings.length} просроченных бронирований`);
    } catch (error) {
      console.error('Ошибка при проверке просроченных бронирований:', error);
    }
  }

  // Обработка просроченного бронирования
  private async handleExpiredBooking(booking: any) {
    try {
      // Отмечаем бронирование как автоматически отклоненное
      booking.status = BookingStatus.REJECTED;
      booking.isAutoRejected = true;
      booking.cancellationReason = 'Мастер не ответил в течение 5 минут';
      await this.bookingRepository.save(booking);

      // Снижаем рейтинг мастера на 5 баллов
      const currentRating = booking.master.rating;
      const newRating = Math.max(0, currentRating - 5); // Минимальный рейтинг 0
      
      await this.masterRepository.update(booking.master.id, {
        rating: newRating,
        responseTimeoutCount: booking.master.responseTimeoutCount + 1
      });

      // Уведомляем клиента
      const clientNotification = this.notificationRepository.create({
        userId: booking.client.userId,
        type: NotificationType.RATING_DECREASED,
        title: 'Мастер не ответил',
        message: `Мастер ${booking.master.user.name} не ответил в течение 5 минут. Его рейтинг понижен. Пожалуйста, выберите другого мастера.`,
        data: {
          bookingId: booking.id,
          masterName: booking.master.user.name,
          oldRating: currentRating,
          newRating: newRating
        }
      });

      await this.notificationRepository.save(clientNotification);

      // Уведомляем мастера о снижении рейтинга
      const masterNotification = this.notificationRepository.create({
        userId: booking.master.userId,
        type: NotificationType.RATING_DECREASED,
        title: 'Рейтинг понижен',
        message: `Ваш рейтинг понижен на 5 баллов за неответ на заявку в течение 5 минут. Текущий рейтинг: ${newRating}`,
        data: {
          bookingId: booking.id,
          oldRating: currentRating,
          newRating: newRating,
          reason: 'Неответ на заявку'
        }
      });

      await this.notificationRepository.save(masterNotification);

      console.log(`Рейтинг мастера ${booking.master.user.name} понижен с ${currentRating} до ${newRating}`);
    } catch (error) {
      console.error('Ошибка при обработке просроченного бронирования:', error);
    }
  }

  // Повышение рейтинга за активность
  async increaseRatingForActivity(masterId: string, points: number, reason: string) {
    try {
      const master = await this.masterRepository.findOne({
        where: { id: masterId },
        relations: ['user']
      });

      if (!master) {
        return;
      }

      const oldRating = master.rating;
      const newRating = Math.min(100, oldRating + points); // Максимальный рейтинг 100

      await this.masterRepository.update(masterId, {
        rating: newRating
      });

      // Уведомляем мастера о повышении рейтинга
      const notification = this.notificationRepository.create({
        userId: master.userId,
        type: NotificationType.RATING_DECREASED, // Используем тот же тип для изменения рейтинга
        title: 'Рейтинг повышен',
        message: `Ваш рейтинг повышен на ${points} баллов за ${reason}. Текущий рейтинг: ${newRating}`,
        data: {
          oldRating,
          newRating,
          points,
          reason
        }
      });

      await this.notificationRepository.save(notification);

      console.log(`Рейтинг мастера ${master.user.name} повышен с ${oldRating} до ${newRating} за ${reason}`);
    } catch (error) {
      console.error('Ошибка при повышении рейтинга:', error);
    }
  }

  // Получение статистики рейтинга мастера
  async getMasterRatingStats(masterId: string) {
    try {
      const master = await this.masterRepository.findOne({
        where: { id: masterId },
        relations: ['user']
      });

      if (!master) {
        return null;
      }

      // Статистика бронирований
      const totalBookings = await this.bookingRepository.count({
        where: { masterId }
      });

      const completedBookings = await this.bookingRepository.count({
        where: { masterId, status: BookingStatus.COMPLETED }
      });

      const cancelledBookings = await this.bookingRepository.count({
        where: { masterId, status: BookingStatus.CANCELLED }
      });

      const autoRejectedBookings = await this.bookingRepository.count({
        where: { masterId, isAutoRejected: true }
      });

      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
      const responseRate = totalBookings > 0 ? ((totalBookings - autoRejectedBookings) / totalBookings) * 100 : 100;

      return {
        currentRating: master.rating,
        totalBookings,
        completedBookings,
        cancelledBookings,
        autoRejectedBookings,
        responseTimeoutCount: master.responseTimeoutCount,
        completionRate: Math.round(completionRate * 100) / 100,
        responseRate: Math.round(responseRate * 100) / 100,
        lastResponseAt: master.lastResponseAt
      };
    } catch (error) {
      console.error('Ошибка при получении статистики рейтинга:', error);
      return null;
    }
  }

  // Запуск периодической проверки (каждую минуту)
  startPeriodicCheck() {
    setInterval(() => {
      this.checkExpiredBookings();
    }, 60000); // 1 минута

    console.log('Запущена периодическая проверка просроченных бронирований');
  }
} 