import express from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../enums/user';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CategoryController.insertIntoDB,
);

router.get(
  '/',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INVENTORY_MANAGER),
  CategoryController.getAllCategories,
);

router.get(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INVENTORY_MANAGER),
  CategoryController.getSingleCategory,
);

router.patch(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CategoryController.updateCategory,
);

router.delete(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CategoryController.deleteCategory,
);

export const CategoryRouter = router;
