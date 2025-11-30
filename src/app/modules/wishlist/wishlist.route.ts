import express from 'express';
import auth from '../../middlewares/auth';
import { WishlistController } from './wishlist.controller';
import { UserRole } from '../../../enums/user';

const router = express.Router();

router.get(
  '/',
  auth(UserRole.CUSTOMER, UserRole.GUEST, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  WishlistController.getWishlist,
);

router.post(
  '/',
  auth(UserRole.CUSTOMER, UserRole.GUEST, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  WishlistController.addToWishlist,
);

router.delete(
  '/product/:productId',
  auth(UserRole.CUSTOMER, UserRole.GUEST, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  WishlistController.removeItemByProduct,
);

router.delete('/',  auth(UserRole.CUSTOMER, UserRole.GUEST, UserRole.SUPER_ADMIN, UserRole.ADMIN), WishlistController.clearWishlist);

export const WishlistRoute = router;
