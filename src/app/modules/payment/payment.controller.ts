import httpStatus from 'http-status';
import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PaymentService } from './payment.service';

const updatePaymentStatus = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const orderId = Number(req.params.orderId);
  const { paymentStatus } = req.body;
  const result = await PaymentService.updatePaymentStatus(
    userId,
    orderId,
    paymentStatus,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment status updated successfully',
    data: result,
  });
});

const getMyPaymentForOrder = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const orderId = Number(req.params.orderId);
  const result = await PaymentService.getMyPaymentForOrder(userId, orderId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  updatePaymentStatus,
  getMyPaymentForOrder,
};
