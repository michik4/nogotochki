import { AppDataSource } from '../config/typeorm';
import { Repository } from 'typeorm';
import { User, UserType } from '../entities/User';
import { Client } from '../entities/Client';
import { Master } from '../entities/Master';
import { hashPassword } from '../utils/password';
import { CreateUserData, UpdateUserData } from '../models/User';

export class UserService {
  private userRepository: Repository<User>;
  private clientRepository: Repository<Client>;
  private masterRepository: Repository<Master>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.clientRepository = AppDataSource.getRepository(Client);
    this.masterRepository = AppDataSource.getRepository(Master);
  }

  // Создание пользователя
  async createUser(userData: CreateUserData): Promise<User> {
    return await AppDataSource.transaction(async manager => {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await manager.findOne(User, {
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      // Хешируем пароль
      const passwordHash = await hashPassword(userData.password);

      // Определяем роль пользователя
      const userRole = userData.role;

      // Создаем пользователя
      const user = manager.create(User, {
        email: userData.email,
        passwordHash,
        name: userData.name,
        phone: userData.phone,
        type: userRole as UserType,
        isActive: true
      });

      const savedUser = await manager.save(user);

      // Если это мастер, создаем запись в таблице masters
      if (userRole === 'master') {
        const master = manager.create(Master, {
          user: savedUser,
          userId: savedUser.id,
          location: userData.location,
          specialties: userData.specialties || [],
          rating: 0,
          reviewsCount: 0,
          isVerified: false
        });
        await manager.save(master);
      }

      // Если это клиент, создаем запись в таблице clients
      if (userRole === 'client') {
        const client = manager.create(Client, {
          user: savedUser,
          userId: savedUser.id,
          location: userData.location
        });
        await manager.save(client);
      }

      return savedUser;
    });
  }

  // Поиск пользователя по email
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, isActive: true }
    });
  }

  // Поиск пользователя по ID
  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, isActive: true }
    });
  }

  // Получение профиля клиента
  async getClientProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId, type: UserType.CLIENT, isActive: true },
      relations: ['client']
    });

    if (!user || !user.client) {
      return null;
    }

    // Объединяем данные пользователя и клиента
    return {
      ...user,
      ...user.client,
      client: undefined // Убираем вложенный объект
    };
  }

  // Получение профиля мастера
  async getMasterProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId, type: UserType.MASTER, isActive: true },
      relations: ['master']
    });

    if (!user || !user.master) {
      return null;
    }

    // Объединяем данные пользователя и мастера
    return {
      ...user,
      ...user.master,
      master: undefined // Убираем вложенный объект
    };
  }

  // Обновление профиля пользователя
  async updateUser(userId: string, updates: UpdateUserData): Promise<User | null> {
    return await AppDataSource.transaction(async manager => {
      const user = await manager.findOne(User, {
        where: { id: userId, isActive: true }
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Обновляем основные поля пользователя
      if (updates.name !== undefined) user.name = updates.name;
      if (updates.phone !== undefined) user.phone = updates.phone;
      if (updates.avatar !== undefined) user.avatarUrl = updates.avatar;

      const savedUser = await manager.save(user);

      // Обновляем специальности мастера, если они переданы
      if (updates.specialties !== undefined && user.type === UserType.MASTER) {
        await manager.update(Master, { userId }, { specialties: updates.specialties });
      }

      // Обновляем локацию для клиента или мастера
      if (updates.location !== undefined) {
        if (user.type === UserType.CLIENT) {
          await manager.update(Client, { userId }, { location: updates.location });
        } else if (user.type === UserType.MASTER) {
          await manager.update(Master, { userId }, { location: updates.location });
        }
      }

      return savedUser;
    });
  }

  // Деактивация пользователя (мягкое удаление)
  async deactivateUser(userId: string): Promise<boolean> {
    const result = await this.userRepository.update(userId, {
      isActive: false
    });

    return (result.affected || 0) > 0;
  }

  // Обновление последнего входа
  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date()
    });
  }

  // Получение списка пользователей (для админки)
  async getUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    return await this.userRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset
    });
  }

  // Получение списка мастеров
  async getMasters(limit: number = 50, offset: number = 0): Promise<any[]> {
    const masters = await this.masterRepository.find({
      relations: ['user'],
      where: { user: { isActive: true } },
      order: { rating: 'DESC', createdAt: 'DESC' },
      take: limit,
      skip: offset
    });

    // Объединяем данные пользователя и мастера
    return masters.map(master => ({
      ...master.user,
      ...master,
      user: undefined // Убираем вложенный объект
    }));
  }

  // Получение мастера по ID
  async getMasterById(masterId: string): Promise<any> {
    const master = await this.masterRepository.findOne({
      where: { id: masterId, user: { isActive: true } },
      relations: ['user']
    });

    if (!master) {
      return null;
    }

    return {
      ...master.user,
      ...master,
      user: undefined
    };
  }

  // Получение клиента по ID
  async getClientById(clientId: string): Promise<any> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId, user: { isActive: true } },
      relations: ['user']
    });

    if (!client) {
      return null;
    }

    return {
      ...client.user,
      ...client,
      user: undefined
    };
  }

  // Поиск мастеров по критериям
  async searchMasters(criteria: {
    location?: string;
    specialties?: string[];
    minRating?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const queryBuilder = this.masterRepository
      .createQueryBuilder('master')
      .leftJoinAndSelect('master.user', 'user')
      .where('master.isVerified = :verified', { verified: true })
      .andWhere('user.isActive = :active', { active: true });

    if (criteria.location) {
      queryBuilder.andWhere('master.location ILIKE :location', {
        location: `%${criteria.location}%`
      });
    }

    if (criteria.specialties && criteria.specialties.length > 0) {
      queryBuilder.andWhere('master.specialties @> :specialties', {
        specialties: JSON.stringify(criteria.specialties)
      });
    }

    if (criteria.minRating) {
      queryBuilder.andWhere('master.rating >= :minRating', {
        minRating: criteria.minRating
      });
    }

    const masters = await queryBuilder
      .orderBy('master.rating', 'DESC')
      .addOrderBy('master.createdAt', 'DESC')
      .take(criteria.limit || 50)
      .skip(criteria.offset || 0)
      .getMany();

    return masters.map(master => ({
      ...master.user,
      ...master,
      user: undefined
    }));
  }
} 