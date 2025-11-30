import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../enums/user';
import { CartController } from './cart.controller';

const router = express.Router();

router.get(
  '/',
  auth(UserRole.CUSTOMER, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CartController.getCart,
);
router.post(
  '/items',
  auth(UserRole.CUSTOMER, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CartController.addItemToCart,
);

router.patch(
  '/items/:itemId',
  auth(UserRole.CUSTOMER, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CartController.updateItemQuantity,
);
router.delete(
  '/items/:itemId',
  auth(UserRole.CUSTOMER, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CartController.removeItemFromCart,
);

router.delete(
  '/',
  auth(UserRole.CUSTOMER, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CartController.clearCart,
);

export const CartRoute = router;
