import httpStatus from 'http-status';
import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AddressService } from './address.service';

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
  const result = await AddressService.getAllUserAddress();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User addresses fetched successfully',
    data: result,
  });
});

const getSingleUserAddress = catchAsync(async (req, res) => {
  const addressId = Number(req.params.id);
  const userId = Number(req?.user?.userId);
  const result = await AddressService.getSingleUserAddress(addressId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User address fetched successfully',
    data: result,
  });
});

const updateUserAddress = catchAsync(async (req, res) => {
  const addressId = Number(req.params.id);
  const userId = Number(req?.user?.userId);
  const result = await AddressService.updateUserAddress(
    userId,
    addressId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User address updated successfully',
    data: result,
  });
});

const deleteUserAddress = catchAsync(async (req, res) => {
  const addressId = Number(req.params.id);
  const userId = Number(req?.user?.userId);
  const result = await AddressService.deleteUserAddress(addressId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User address deleted successfully',
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
