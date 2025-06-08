import { Router } from 'express';

const adminRouter = Router();

// GET /admin/designs - Получение всех дизайнов (админ)
adminRouter.get('/designs', (req, res) => {
  res.json({ 
    message: 'Admin get all designs endpoint',
    method: 'GET',
    path: '/admin/designs',
    status: 'в разработке'
  });
});

// PUT /admin/designs/:id - Обновление дизайна (админ)
adminRouter.put('/designs/:id', (req, res) => {
  res.json({ 
    message: 'Admin update design endpoint',
    method: 'PUT',
    path: `/admin/designs/${req.params.id}`,
    status: 'в разработке'
  });
});

// DELETE /admin/designs/:id - Удаление дизайна (админ)
adminRouter.delete('/designs/:id', (req, res) => {
  res.json({ 
    message: 'Admin delete design endpoint',
    method: 'DELETE',
    path: `/admin/designs/${req.params.id}`,
    status: 'в разработке'
  });
});

// POST /admin/designs - Создание дизайна (админ)
adminRouter.post('/designs', (req, res) => {
  res.json({ 
    message: 'Admin create design endpoint',
    method: 'POST',
    path: '/admin/designs',
    status: 'в разработке'
  });
});

// GET /admin/users - Получение всех пользователей (админ)
adminRouter.get('/users', (req, res) => {
  res.json({ 
    message: 'Admin get all users endpoint',
    method: 'GET',
    path: '/admin/users',
    status: 'в разработке'
  });
});

// PUT /admin/users/:id/block - Блокировка пользователя (админ)
adminRouter.put('/users/:id/block', (req, res) => {
  res.json({ 
    message: 'Admin block user endpoint',
    method: 'PUT',
    path: `/admin/users/${req.params.id}/block`,
    status: 'в разработке'
  });
});

// GET /admin/masters - Получение всех мастеров (админ)
adminRouter.get('/masters', (req, res) => {
  res.json({ 
    message: 'Admin get all masters endpoint',
    method: 'GET',
    path: '/admin/masters',
    status: 'в разработке'
  });
});

export default adminRouter; 