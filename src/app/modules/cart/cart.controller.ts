import httpStatus from 'http-status';
import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CartService } from './cart.service';

const getCart = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const cart = await CartService.getCart(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart retrieved successfully',
    data: cart,
  });
});

const addItemToCart = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const payload = req.body;
  const cart = await CartService.addItemToCart(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Item added to cart successfully',
    data: cart,
  });
});

const updateItemQuantity = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const cartItemId = Number(req.params.itemId);
  const { quantity } = req.body;
  const cart = await CartService.updateItemQuantity(
    userId,
    cartItemId,
    quantity,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart item quantity updated successfully',
    data: cart,
  });
});

const removeItemFromCart = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const cartItemId = Number(req.params.itemId);
  const cart = await CartService.removeItem(userId, cartItemId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart item removed successfully',
    data: cart,
  });
});

const clearCart = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const cart = await CartService.clearCart(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart cleared successfully',
    data: cart,
  });
});

export const CartController = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
};
