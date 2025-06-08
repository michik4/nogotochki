import { Router } from 'express';
import { DesignController } from '../controllers/design.controller';
import { CommentController } from '../controllers/comment.controller';
import { authenticateToken, optionalAuth, requireMasterOrAdmin } from '../middleware/auth.middleware';

const designsRouter = Router();
const designController = new DesignController();
const commentController = new CommentController();

// GET /designs - Получение каталога дизайнов
designsRouter.get('/', optionalAuth, designController.getCatalog.bind(designController));

// POST /designs - Создание нового дизайна
designsRouter.post('/', authenticateToken, designController.createDesign.bind(designController));

// GET /designs/favorites - Получение избранных дизайнов
designsRouter.get('/favorites', authenticateToken, designController.getFavorites.bind(designController));

// GET /designs/:id - Получение дизайна по ID
designsRouter.get('/:id', optionalAuth, designController.getDesignById.bind(designController));

// POST /designs/:id/like - Лайк/дизлайк дизайна
designsRouter.post('/:id/like', authenticateToken, designController.toggleLike.bind(designController));

// POST /designs/:id/master-catalog - Мастер добавляет дизайн в свой каталог
designsRouter.post('/:id/master-catalog', authenticateToken, designController.addToMasterCatalog.bind(designController));

// GET /designs/:id/masters - Получение мастеров для дизайна
designsRouter.get('/:id/masters', designController.getMastersForDesign.bind(designController));

// GET /designs/:id/comments - Получение комментариев к дизайну
designsRouter.get('/:id/comments', commentController.getCommentsByDesign.bind(commentController));

// POST /designs/:id/comments - Добавление комментария к дизайну
designsRouter.post('/:id/comments', authenticateToken, commentController.createComment.bind(commentController));

// PUT /designs/:id/comments/:commentId - Обновление комментария
designsRouter.put('/:id/comments/:commentId', authenticateToken, commentController.updateComment.bind(commentController));

// DELETE /designs/:id/comments/:commentId - Удаление комментария
designsRouter.delete('/:id/comments/:commentId', authenticateToken, commentController.deleteComment.bind(commentController));

// GET /designs/:id/comments/:commentId/answer - Получение ответа на комментарий
designsRouter.get('/:id/comments/:commentId/answer', commentController.getAnswer.bind(commentController));

// POST /designs/:id/comments/:commentId/answer - Добавление ответа на комментарий
designsRouter.post('/:id/comments/:commentId/answer', authenticateToken, commentController.createAnswer.bind(commentController));

// PUT /designs/:id/comments/:commentId/answer - Обновление ответа на комментарий
designsRouter.put('/:id/comments/:commentId/answer', authenticateToken, commentController.updateAnswer.bind(commentController));

// DELETE /designs/:id/comments/:commentId/answer - Удаление ответа на комментарий
designsRouter.delete('/:id/comments/:commentId/answer', authenticateToken, commentController.deleteAnswer.bind(commentController));

export default designsRouter; 