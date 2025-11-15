import httpStatus from 'http-status';
import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AddressService } from './address.service';
import ApiError from '../../../errors/ApiError';

const insertIntoDB = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const result = await AddressService.insertIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Address added successfully',
    data: result,
  });
});

const getAllUserAddress = catchAsync(async (req, res) => {
  const roles = req.user?.roles || [];

  if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: Insufficient role');
  }

  const result = await AddressService.getAllUserAddress();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All user addresses fetched successfully',
    data: result,
  });
});

const getSingleUserAddress = catchAsync(async (req, res) => {
  const addressId = Number(req.params.id);
  const userId = req.user?.userId;
  const roles = req.user?.roles || [];

  const result = await AddressService.getSingleUserAddress(
    addressId,
    userId,
    roles,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Address fetched successfully',
    data: result,
  });
});

const updateUserAddress = catchAsync(async (req, res) => {
  const addressId = Number(req.params.id);
  const userId = req.user?.userId;
  const roles = req.user?.roles || [];

  const result = await AddressService.updateUserAddress(
    userId,
    addressId,
    roles,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Address updated successfully',
    data: result,
  });
});

const deleteUserAddress = catchAsync(async (req, res) => {
  const addressId = Number(req.params.id);
  const userId = req.user?.userId;
  const roles = req.user?.roles || [];

  const result = await AddressService.deleteUserAddress(
    addressId,
    userId,
    roles,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Address deleted successfully',
    data: result,
  });
});

export const AddressController = {
  insertIntoDB,
  getAllUserAddress,
  getSingleUserAddress,
  updateUserAddress,
  deleteUserAddress,
};
