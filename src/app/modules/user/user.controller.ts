import httpStatus from 'http-status';
import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import ApiError from '../../../errors/ApiError';


const getAllUserProfiles = catchAsync(async (req, res) => {
  const roles = req.user?.roles || [];

  // Only admin or super admin can view all profiles
  if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

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
  const loggedInUserId = req.user?.userId;
  const roles = req.user?.roles || [];

  // Admin or super admin? → allow any
  if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
    // Customer → allow only own
    if (loggedInUserId !== userId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You are not allowed to access this profile',
      );
    }
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
  const loggedInUserId = req.user?.userId;
  const roles = req.user?.roles || [];

  // Admin & Super Admin → can update any profile
  if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
    // Customer → only own
    if (loggedInUserId !== userId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You are not allowed to update this profile',
      );
    }
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
  const loggedInUserId = req.user?.userId;
  const roles = req.user?.roles || [];

  // Admin & Super Admin → can delete any profile
  if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
    // Customer → only own
    if (loggedInUserId !== userId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You are not allowed to delete this profile',
      );
    }
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
