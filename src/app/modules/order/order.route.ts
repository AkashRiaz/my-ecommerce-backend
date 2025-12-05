import express from 'express';
import { OrderController } from './order.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../enums/user';
const router = express.Router();

router.post(
  '/checkout-summary',
  auth(UserRole.SUPER_ADMIN, UserRole.CUSTOMER, UserRole.GUEST, UserRole.ADMIN),
  OrderController.getCheckoutSummary,
);
router.post(
  '/',
  auth(UserRole.SUPER_ADMIN, UserRole.CUSTOMER, UserRole.GUEST, UserRole.ADMIN),
  OrderController.createOrderFromCart,
);
router.get(
  '/',
  auth(UserRole.SUPER_ADMIN, UserRole.CUSTOMER, UserRole.GUEST, UserRole.ADMIN),
  OrderController.getMyOrders,
);
router.get(
  '/:orderId',
  auth(UserRole.SUPER_ADMIN, UserRole.CUSTOMER, UserRole.GUEST, UserRole.ADMIN),
  OrderController.getMyOrderById,
);

router.patch(
  '/:orderId/status',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  OrderController.updateOrderStatus,
);

export const OrderRoute = router;
