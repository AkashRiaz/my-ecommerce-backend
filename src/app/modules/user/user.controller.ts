import httpStatus from 'http-status';
import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { th } from 'zod/v4/locales';
import ApiError from '../../../errors/ApiError';

const getAllUserProfiles = catchAsync(async (req, res) => {
  const result = await UserService.getAllUserProfiles();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All user profiles fetched successfully',
    data: result,
  });
});

const getUserProfile = catchAsync(async (req, res) => {
  const userId = Number(req.params.id);
  if (req?.user?.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not allowed to access this profile',
    );
  }
  const result = await UserService.getUserProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile fetched successfully',
    data: result,
  });
});

const updateUserProfile = catchAsync(async (req, res) => {
  const userId = Number(req.params.id);
  if (req?.user?.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not allowed to update this profile',
    );
  }

  const result = await UserService.updateProfile(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile updated successfully',
    data: result,
  });
});

const deleteUserProfile = catchAsync(async (req, res) => {
  const userId = Number(req.params.id);
  if (req?.user?.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not allowed to delete this profile',
    );
  }

  const result = await UserService.deleteUserProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile deleted successfully',
    data: result,
  });
});

export const UserController = {
  getUserProfile,
  getAllUserProfiles,
  updateUserProfile,
  deleteUserProfile,
};
