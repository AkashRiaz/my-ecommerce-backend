import httpStatus from 'http-status';
import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OrderService } from './order.service';

const getCheckoutSummary = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const payload = req.body;

  const result = await OrderService.getCheckoutSummary(userId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Checkout summary retrieved successfully',
    data: result,
  });
});

const createOrderFromCart = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const payload = req.body;
  const result = await OrderService.createOrderFromCart(userId, payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const result = await OrderService.getMyOrders(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders retrieved successfully',
    data: result,
  });
});

const getMyOrderById = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const orderId = Number(req.params.orderId);
  const result = await OrderService.getMyOrderById(userId, orderId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const orderId = Number(req.params.orderId);
  const { status } = req.body;
  const result = await OrderService.updateOrderStatus(userId, orderId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

export const OrderController = {
  getCheckoutSummary,
  createOrderFromCart,
  getMyOrders,
  getMyOrderById,
  updateOrderStatus,
};
