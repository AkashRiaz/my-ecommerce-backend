import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../enums/user';
import { PaymentController } from './payment.controller';
const router = express.Router();

router.patch(
  '/:orderId/payment-status',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  PaymentController.updatePaymentStatus,
);

router.get(
  '/:orderId/my-payment',
  auth(UserRole.CUSTOMER, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PaymentController.getMyPaymentForOrder,
);

export const PaymentRoute = router;
