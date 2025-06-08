import { Request, Response } from 'express';
import { AppDataSource } from '../config/typeorm';
import { Comment } from '../entities/Comment';
import { Design } from '../entities/Design';
import { User } from '../entities/User';

export class CommentController {
  private commentRepository = AppDataSource.getRepository(Comment);
  private designRepository = AppDataSource.getRepository(Design);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * @swagger
   * /designs/{id}/comments:
   *   get:
   *     summary: Получение комментариев к дизайну
   *     description: Получение списка комментариев к конкретному дизайну с пагинацией
   *     tags: [Comments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID дизайна
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
   *         description: Комментарии получены успешно
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 comments:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Comment'
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
  async getCommentsByDesign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const design = await this.designRepository.findOne({ where: { id } });
      if (!design) {
        return res.status(404).json({ error: 'Дизайн не найден' });
      }

      const queryBuilder = this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('comment.answer', 'answer')
        .leftJoinAndSelect('answer.user', 'answerUser')
        .where('comment.designId = :designId', { designId: id })
        .andWhere('comment.isActive = :isActive', { isActive: true })
        .orderBy('comment.createdAt', 'DESC');

      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(skip).take(Number(limit));

      const [comments, total] = await queryBuilder.getManyAndCount();

      return res.json({
        comments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting comments:', error);
      return res.status(500).json({ error: 'Ошибка получения комментариев' });
    }
  }

  /**
   * @swagger
   * /designs/{id}/comments:
   *   post:
   *     summary: Создание комментария
   *     description: Создание нового комментария к дизайну
   *     tags: [Comments]
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
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CommentCreateRequest'
   *     responses:
   *       201:
   *         description: Комментарий создан успешно
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Comment'
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
  async createComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Содержимое комментария не может быть пустым' });
      }

      const design = await this.designRepository.findOne({ where: { id } });
      if (!design) {
        return res.status(404).json({ error: 'Дизайн не найден' });
      }

      const comment = this.commentRepository.create({
        content: content.trim(),
        designId: id,
        userId
      });

      const savedComment = await this.commentRepository.save(comment);

      // Получаем комментарий с пользователем
      const commentWithUser = await this.commentRepository.findOne({
        where: { id: savedComment.id },
        relations: ['user']
      });

      return res.status(201).json(commentWithUser);
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Ошибка создания комментария' });
    }
  }

  // Обновление комментария
  async updateComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Содержимое комментария не может быть пустым' });
      }

      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['user']
      });

      if (!comment) {
        return res.status(404).json({ error: 'Комментарий не найден' });
      }

      // Проверяем права на редактирование
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (comment.userId !== userId && user?.type !== 'admin') {
        return res.status(403).json({ error: 'Можно редактировать только свои комментарии' });
      }

      comment.content = content.trim();
      const updatedComment = await this.commentRepository.save(comment);

      return res.json(updatedComment);
    } catch (error) {
      console.error('Error updating comment:', error);
      return res.status(500).json({ error: 'Ошибка обновления комментария' });
    }
  }

  // Удаление комментария
  async deleteComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['user']
      });

      if (!comment) {
        return res.status(404).json({ error: 'Комментарий не найден' });
      }

      // Проверяем права на удаление
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (comment.userId !== userId && user?.type !== 'admin') {
        return res.status(403).json({ error: 'Можно удалять только свои комментарии' });
      }

      // Мягкое удаление - помечаем как неактивный
      comment.isActive = false;
      await this.commentRepository.save(comment);

      return res.json({ message: 'Комментарий удален' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: 'Ошибка удаления комментария' });
    }
  }

  // Создание ответа на комментарий
  async createAnswer(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Содержимое ответа не может быть пустым' });
      }

      const originalComment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['design']
      });

      if (!originalComment) {
        return res.status(404).json({ error: 'Комментарий не найден' });
      }

      // Проверяем, нет ли уже ответа
      if (originalComment.answerId) {
        return res.status(400).json({ error: 'На этот комментарий уже есть ответ' });
      }

      // Создаем ответ
      const answer = this.commentRepository.create({
        content: content.trim(),
        designId: originalComment.designId,
        userId
      });

      const savedAnswer = await this.commentRepository.save(answer);

      // Связываем ответ с оригинальным комментарием
      originalComment.answerId = savedAnswer.id;
      await this.commentRepository.save(originalComment);

      // Получаем ответ с пользователем
      const answerWithUser = await this.commentRepository.findOne({
        where: { id: savedAnswer.id },
        relations: ['user']
      });

      return res.status(201).json(answerWithUser);
    } catch (error) {
      console.error('Error creating answer:', error);
      return res.status(500).json({ error: 'Ошибка создания ответа' });
    }
  }

  // Получение ответа на комментарий
  async getAnswer(req: Request, res: Response) {
    try {
      const { commentId } = req.params;

      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['answer', 'answer.user']
      });

      if (!comment) {
        return res.status(404).json({ error: 'Комментарий не найден' });
      }

      if (!comment.answer) {
        return res.status(404).json({ error: 'Ответ не найден' });
      }

      return res.json(comment.answer);
    } catch (error) {
      console.error('Error getting answer:', error);
      return res.status(500).json({ error: 'Ошибка получения ответа' });
    }
  }

  // Обновление ответа на комментарий
  async updateAnswer(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Содержимое ответа не может быть пустым' });
      }

      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['answer']
      });

      if (!comment || !comment.answer) {
        return res.status(404).json({ error: 'Ответ не найден' });
      }

      // Проверяем права на редактирование
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (comment.answer.userId !== userId && user?.type !== 'admin') {
        return res.status(403).json({ error: 'Можно редактировать только свои ответы' });
      }

      comment.answer.content = content.trim();
      const updatedAnswer = await this.commentRepository.save(comment.answer);

      return res.json(updatedAnswer);
    } catch (error) {
      console.error('Error updating answer:', error);
      return res.status(500).json({ error: 'Ошибка обновления ответа' });
    }
  }

  // Удаление ответа на комментарий
  async deleteAnswer(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
      }

      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['answer']
      });

      if (!comment || !comment.answer) {
        return res.status(404).json({ error: 'Ответ не найден' });
      }

      // Проверяем права на удаление
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (comment.answer.userId !== userId && user?.type !== 'admin') {
        return res.status(403).json({ error: 'Можно удалять только свои ответы' });
      }

      // Удаляем связь и сам ответ
      comment.answerId = undefined;
      await this.commentRepository.save(comment);
      
      comment.answer.isActive = false;
      await this.commentRepository.save(comment.answer);

      return res.json({ message: 'Ответ удален' });
    } catch (error) {
      console.error('Error deleting answer:', error);
      return res.status(500).json({ error: 'Ошибка удаления ответа' });
    }
  }
} 