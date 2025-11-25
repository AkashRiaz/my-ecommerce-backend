import express from 'express';
import { ProductController } from './product.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../enums/user';
const router = express.Router();

router.post(
  '/create',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ProductController.insertIntoDB,
);
router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INVENTORY_MANAGER),
  ProductController.getAllProducts,
);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INVENTORY_MANAGER),
  ProductController.getSingleProduct,
);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ProductController.updateProduct,
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ProductController.deleteProduct,
);

export const ProductRouter = router;
