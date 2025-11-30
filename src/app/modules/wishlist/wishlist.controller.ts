import httpStatus from 'http-status';
import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { WishlistService } from './wishlist.service';

const getWishlist = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const wishlist = await WishlistService.getWishlist(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wishlist fetched successfully',
    data: wishlist,
  });
});

const addToWishlist = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const payload = req.body;
  const wishlist = await WishlistService.addToWishlist(userId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product added to wishlist successfully',
    data: wishlist,
  });
});

const removeItemByProduct = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const productId = Number(req.params.productId);
  const wishlist = await WishlistService.removeItemByProduct(userId, productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product removed from wishlist successfully',
    data: wishlist,
  });
});

const clearWishlist = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const wishlist = await WishlistService.clearWishlist(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wishlist cleared successfully',
    data: wishlist,
  });
});

export const WishlistController = {
  getWishlist,
  addToWishlist,
  removeItemByProduct,
  clearWishlist,
};
