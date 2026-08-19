import fs from 'fs';
import path from 'path';

const controllersDir = path.join(process.cwd(), 'backend/src/controllers');
const routesDir = path.join(process.cwd(), 'backend/src/routes');

const entities = ['income', 'expense', 'invoice', 'client', 'vendor', 'budget', 'notification', 'user', 'auditLog', 'setting'];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

entities.forEach(entity => {
  const capEntity = capitalize(entity);
  const controllerContent = `import prisma from '../utils/prisma.js';

export const get${capEntity}s = async (req, res, next) => {
  try {
    const data = await prisma.${entity}.findMany();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const get${capEntity}ById = async (req, res, next) => {
  try {
    const data = await prisma.${entity}.findUnique({ where: { id: req.params.id } });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const create${capEntity} = async (req, res, next) => {
  try {
    const data = await prisma.${entity}.create({ data: { ...req.body, ${entity === 'user' ? '' : 'createdById: req.user.id'} } });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

export const update${capEntity} = async (req, res, next) => {
  try {
    const data = await prisma.${entity}.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const delete${capEntity} = async (req, res, next) => {
  try {
    await prisma.${entity}.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) { next(error); }
};
`;

  const routeContent = `import express from 'express';
import { get${capEntity}s, get${capEntity}ById, create${capEntity}, update${capEntity}, delete${capEntity} } from '../controllers/${entity}Controller.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/', get${capEntity}s);
router.get('/:id', get${capEntity}ById);
router.post('/', authorize('SUPER_ADMIN', 'FINANCE_ADMIN'), create${capEntity});
router.put('/:id', authorize('SUPER_ADMIN', 'FINANCE_ADMIN'), update${capEntity});
router.delete('/:id', authorize('SUPER_ADMIN'), delete${capEntity});

export default router;
`;

  fs.writeFileSync(path.join(controllersDir, `${entity}Controller.js`), controllerContent);
  fs.writeFileSync(path.join(routesDir, `${entity}Routes.js`), routeContent);
});

console.log('Controllers and Routes generated.');
