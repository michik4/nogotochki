import { Request, Response } from 'express';
import { AppDataSource } from '../config/typeorm';
import { Design, DesignCategory, DesignDifficulty } from '../entities/Design';
import { Like } from '../entities/Like';
import { Comment } from '../entities/Comment';
import { MasterDesign } from '../entities/MasterDesign';
import { Master } from '../entities/Master';
import { User } from '../entities/User';

/**
 * @swagger
 * components:
 *   schemas:
 *     DesignFilter:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           description: Номер страницы
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *           description: Количество элементов на странице
 *         category:
 *           type: string
 *           enum: [classic, french, gel, art, seasonal, manicure, pedicure, nail_art, extension, repair]
 *           description: Категория дизайна
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Сложность выполнения
 *         search:
 *           type: string
 *           description: Поиск по названию, описанию или тегам
 *         sortBy:
 *           type: string
 *           enum: [createdAt, likesCount, viewsCount, title]
 *           default: createdAt
 *           description: Поле для сортировки
 *         sortOrder:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *           description: Порядок сортировки
 *         isBaseCatalog:
 *           type: boolean
 *           description: Фильтр по базовому каталогу
 *         latitude:
 *           type: number
 *           format: float
 *           description: Широта для геофильтра
 *         longitude:
 *           type: number
 *           format: float
 *           description: Долгота для геофильтра
 *         radius:
 *           type: number
 *           default: 50
 *           description: Радиус поиска в км
 */
export class DesignController {
  private designRepository = AppDataSource.getRepository(Design);
  private likeRepository = AppDataSource.getRepository(Like);
  private commentRepository = AppDataSource.getRepository(Comment);
  private masterDesignRepository = AppDataSource.getRepository(MasterDesign);
  private masterRepository = AppDataSource.getRepository(Master);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * @swagger
   * /designs:
   *   get:
   *     summary: Получение каталога дизайнов
   *     description: Получение списка дизайнов с возможностью фильтрации, поиска и пагинации
   *     tags: [Designs]
   *     parameters:
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
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum: [classic, french, gel, art, seasonal, manicure, pedicure, nail_art, extension, repair]
   *         description: Категория дизайна
   *       - in: query
   *         name: difficulty
   *         schema:
   *           type: string
   *           enum: [easy, medium, hard, expert]
   *         description: Сложность выполнения
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Поиск по названию, описанию или тегам
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, likesCount, viewsCount, title]
   *           default: createdAt
   *         description: Поле для сортировки
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [ASC, DESC]
   *           default: DESC
   *         description: Порядок сортировки
   *       - in: query
   *         name: isBaseCatalog
   *         schema:
   *           type: boolean
   *         description: Фильтр по базовому каталогу
   *       - in: query
   *         name: latitude
   *         schema:
   *           type: number
   *           format: float
   *         description: Широта для геофильтра
   *       - in: query
   *         name: longitude
   *         schema:
   *           type: number
   *           format: float
   *         description: Долгота для геофильтра
   *       - in: query
   *         name: radius
   *         schema:
   *           type: number
   *           default: 50
   *         description: Радиус поиска в км
   *     responses:
   *       200:
   *         description: Список дизайнов получен успешно
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DesignListResponse'
   *       500:
   *         description: Внутренняя ошибка сервера
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getCatalog(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        difficulty,
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        isBaseCatalog,
        latitude,
        longitude,
        radius = 50
      } = req.query;

      const queryBuilder = this.designRepository
        .createQueryBuilder('design')
        .leftJoinAndSelect('design.master', 'master')
        .leftJoinAndSelect('master.user', 'masterUser')
        .leftJoinAndSelect('design.author', 'author')
        .where('design.isActive = :isActive', { isActive: true })
        .andWhere('design.isApproved = :isApproved', { isApproved: true });

      // Фильтры
      if (category) {
        queryBuilder.andWhere('design.category = :category', { category });
      }

      if (difficulty) {
        queryBuilder.andWhere('design.difficulty = :difficulty', { difficulty });
      }

      if (isBaseCatalog !== undefined) {
        queryBuilder.andWhere('design.isBaseCatalog = :isBaseCatalog', { isBaseCatalog });
      }

      if (search) {
        queryBuilder.andWhere(
          '(design.title ILIKE :search OR design.description ILIKE :search OR design.tags::text ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Геофильтр для поиска мастеров рядом
      if (latitude && longitude) {
        queryBuilder.andWhere(
          `ST_DWithin(
            ST_MakePoint(master.longitude, master.latitude)::geography,
            ST_MakePoint(:longitude, :latitude)::geography,
            :radius * 1000
          )`,
          { latitude: parseFloat(latitude as string), longitude: parseFloat(longitude as string), radius }
        );
      }

      // Сортировка
      const validSortFields = ['createdAt', 'likesCount', 'viewsCount', 'title'];
      const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';
      queryBuilder.orderBy(`design.${sortField}`, sortOrder as 'ASC' | 'DESC');

      // Пагинация
      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(skip).take(Number(limit));

      const [designs, total] = await queryBuilder.getManyAndCount();

      // Увеличиваем счетчик просмотров
      if (designs.length > 0) {
        await this.designRepository
          .createQueryBuilder()
          .update(Design)
          .set({ viewsCount: () => 'views_count + 1' })
          .whereInIds(designs.map(d => d.id))
          .execute();
      }

      return res.json({
        designs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting catalog:', error);
      return res.status(500).json({ error: 'Ошибка получения каталога' });
    }
  }

  /**
   * @swagger
   * /designs/{id}:
   *   get:
   *     summary: Получение дизайна по ID
   *     description: Получение подробной информации о дизайне по его идентификатору
   *     tags: [Designs]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID дизайна
   *     responses:
   *       200:
   *         description: Дизайн найден
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Design'
   *                 - type: object
   *                   properties:
   *                     isLiked:
   *                       type: boolean
   *                       description: Лайкнул ли текущий пользователь
   *       404:
   *         description: Дизайн не найден
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
  async getDesignById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const design = await this.designRepository
        .createQueryBuilder('design')
        .leftJoinAndSelect('design.master', 'master')
        .leftJoinAndSelect('master.user', 'masterUser')
        .leftJoinAndSelect('design.author', 'author')
        .where('design.id = :id', { id })
        .andWhere('design.isActive = :isActive', { isActive: true })
        .getOne();

      if (!design) {
        return res.status(404).json({ error: 'Дизайн не найден' });
      }

      // Проверяем, лайкнул ли пользователь этот дизайн
      let isLiked = false;
      if (userId) {
        const like = await this.likeRepository.findOne({
          where: { designId: id, userId }
        });
        isLiked = !!like;
      }

      // Увеличиваем счетчик просмотров
      await this.designRepository.update(id, {
        viewsCount: design.viewsCount + 1
      });

      return res.json({
        ...design,
        isLiked
      });
    } catch (error) {
      console.error('Error getting design:', error);
      return res.status(500).json({ error: 'Ошибка получения дизайна' });
    }
  }

  /**
   * @swagger
   * /designs:
   *   post:
   *     summary: Создание нового дизайна
   *     description: Создание нового дизайна маникюра
   *     tags: [Designs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DesignCreateRequest'
   *     responses:
   *       201:
   *         description: Дизайн создан успешно
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Дизайн создан успешно
   *                 data:
   *                   $ref: '#/components/schemas/Design'
   *       400:
   *         description: Некорректные данные
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
   *       500:
   *         description: Внутренняя ошибка сервера
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async createDesign(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const {
        title,
        description,
        category,
        difficulty = DesignDifficulty.MEDIUM,
        imageUrls,
        videoUrls,
        tags,
        price,
        durationMinutes,
        isBaseCatalog = false
      } = req.body;

      // Валидация обязательных полей
      if (!title) {
        return res.status(400).json({ error: 'Название дизайна обязательно' });
      }

      if (!category) {
        return res.status(400).json({ error: 'Категория дизайна обязательна' });
      }

      // Проверяем валидность категории
      if (!Object.values(DesignCategory).includes(category)) {
        return res.status(400).json({
          error: 'Недопустимая категория дизайна',
          validCategories: Object.values(DesignCategory)
        });
      }

      // Проверяем, является ли пользователь мастером
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['master']
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const design = this.designRepository.create({
        title,
        description,
        category,
        difficulty,
        imageUrls,
        videoUrls,
        tags,
        price,
        durationMinutes,
        isBaseCatalog,
        authorId: userId,
        masterId: user.master?.id,
        isApproved: user.type === 'admin' // Админские дизайны автоматически одобряются
      });

      const savedDesign = await this.designRepository.save(design);

      return res.status(201).json({
        success: true,
        message: 'Дизайн создан успешно',
        data: savedDesign
      });
    } catch (error) {
      console.error('Error creating design:', error);
      return res.status(500).json({ error: 'Ошибка создания дизайна' });
    }
  }

  /**
   * @swagger
   * /designs/{id}/like:
   *   post:
   *     summary: Лайк/дизлайк дизайна
   *     description: Переключение лайка дизайна (добавление или удаление)
   *     tags: [Likes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID дизайна
   *     responses:
   *       200:
   *         description: Лайк переключен успешно
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 liked:
   *                   type: boolean
   *                   description: Лайкнут ли дизайн после операции
   *                 likesCount:
   *                   type: integer
   *                   description: Общее количество лайков
   *       401:
   *         description: Необходима авторизация
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Дизайн не найден
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
  async toggleLike(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const design = await this.designRepository.findOne({ where: { id } });
      if (!design) {
        return res.status(404).json({ error: 'Дизайн не найден' });
      }

      const existingLike = await this.likeRepository.findOne({
        where: { designId: id, userId }
      });

      if (existingLike) {
        // Убираем лайк
        await this.likeRepository.remove(existingLike);
        await this.designRepository.update(id, {
          likesCount: design.likesCount - 1
        });
        return res.json({ liked: false, likesCount: design.likesCount - 1 });
      } else {
        // Добавляем лайк
        const like = this.likeRepository.create({ designId: id, userId });
        await this.likeRepository.save(like);
        await this.designRepository.update(id, {
          likesCount: design.likesCount + 1
        });
        return res.json({ liked: true, likesCount: design.likesCount + 1 });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return res.status(500).json({ error: 'Ошибка обработки лайка' });
    }
  }

  /**
   * @swagger
   * /designs/{id}/master-catalog:
   *   post:
   *     summary: Добавление дизайна в каталог мастера
   *     description: Мастер добавляет дизайн в свой каталог ("я так могу")
   *     tags: [Designs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID дизайна
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               price:
   *                 type: number
   *                 format: decimal
   *                 description: Цена мастера за этот дизайн
   *               durationMinutes:
   *                 type: integer
   *                 description: Время выполнения в минутах
   *               notes:
   *                 type: string
   *                 description: Заметки мастера о дизайне
   *     responses:
   *       200:
   *         description: Дизайн добавлен в каталог мастера
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         description: Дизайн уже добавлен в каталог
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
   *         description: Только мастера могут добавлять дизайны
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Дизайн не найден
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
  async addToMasterCatalog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['master']
      });

      if (!user?.master) {
        return res.status(403).json({ error: 'Только мастера могут добавлять дизайны в каталог' });
      }

      const design = await this.designRepository.findOne({ where: { id } });
      if (!design) {
        return res.status(404).json({ error: 'Дизайн не найден' });
      }

      // Проверяем, не добавлен ли уже этот дизайн
      const existingMasterDesign = await this.masterDesignRepository.findOne({
        where: { designId: id, masterId: user.master.id }
      });

      if (existingMasterDesign) {
        return res.status(400).json({ error: 'Дизайн уже добавлен в ваш каталог' });
      }

      const { price, durationMinutes, notes } = req.body;

      const masterDesign = this.masterDesignRepository.create({
        designId: id,
        masterId: user.master.id,
        price,
        durationMinutes,
        notes
      });

      await this.masterDesignRepository.save(masterDesign);

      return res.status(200).json({
        message: 'Дизайн добавлен в ваш каталог',
        success: true
      });
    } catch (error) {
      console.error('Error adding to master catalog:', error);
      return res.status(500).json({ error: 'Ошибка добавления в каталог мастера', success: false });
    }
  }

  /**
   * @swagger
   * /designs/{id}/masters:
   *   get:
   *     summary: Получение мастеров для дизайна
   *     description: Получение списка мастеров, которые могут выполнить данный дизайн
   *     tags: [Designs]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID дизайна
   *       - in: query
   *         name: latitude
   *         schema:
   *           type: number
   *           format: float
   *         description: Широта для геофильтра
   *       - in: query
   *         name: longitude
   *         schema:
   *           type: number
   *           format: float
   *         description: Долгота для геофильтра
   *       - in: query
   *         name: radius
   *         schema:
   *           type: number
   *           default: 50
   *         description: Радиус поиска в км
   *     responses:
   *       200:
   *         description: Список мастеров получен успешно
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/MasterDesign'
   *       500:
   *         description: Внутренняя ошибка сервера
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getMastersForDesign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { latitude, longitude, radius = 50 } = req.query;

      let queryBuilder = this.masterDesignRepository
        .createQueryBuilder('masterDesign')
        .leftJoinAndSelect('masterDesign.master', 'master')
        .leftJoinAndSelect('master.user', 'user')
        .where('masterDesign.designId = :designId', { designId: id })
        .andWhere('masterDesign.isAvailable = :isAvailable', { isAvailable: true })
        .andWhere('master.isVerified = :isVerified', { isVerified: true });

      // Геофильтр
      if (latitude && longitude) {
        queryBuilder = queryBuilder.andWhere(
          `ST_DWithin(
            ST_MakePoint(master.longitude, master.latitude)::geography,
            ST_MakePoint(:longitude, :latitude)::geography,
            :radius * 1000
          )`,
          { latitude: parseFloat(latitude as string), longitude: parseFloat(longitude as string), radius }
        );
      }

      queryBuilder = queryBuilder.orderBy('master.rating', 'DESC');

      const masterDesigns = await queryBuilder.getMany();

      return res.json(masterDesigns);
    } catch (error) {
      console.error('Error getting masters for design:', error);
      return res.status(500).json({ error: 'Ошибка получения мастеров' });
    }
  }

  /**
   * @swagger
   * /designs/favorites:
   *   get:
   *     summary: Получение избранных дизайнов
   *     description: Получение списка дизайнов, которые пользователь добавил в избранное
   *     tags: [Designs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
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
   *         description: Избранные дизайны получены успешно
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DesignListResponse'
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
  async getFavorites(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const { page = 1, limit = 20 } = req.query;

      const queryBuilder = this.likeRepository
        .createQueryBuilder('like')
        .leftJoinAndSelect('like.design', 'design')
        .leftJoinAndSelect('design.master', 'master')
        .leftJoinAndSelect('master.user', 'masterUser')
        .where('like.userId = :userId', { userId })
        .andWhere('design.isActive = :isActive', { isActive: true })
        .orderBy('like.createdAt', 'DESC');

      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(skip).take(Number(limit));

      const [likes, total] = await queryBuilder.getManyAndCount();
      const designs = likes.map(like => like.design);

      return res.json({
        designs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting favorites:', error);
      return res.status(500).json({ error: 'Ошибка получения избранного' });
    }
  }
} 