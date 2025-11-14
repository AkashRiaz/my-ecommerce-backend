import httpStatus from 'http-status';
import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';

const signupUser = catchAsync(async (req, res) => {
  const result = await AuthService.signupUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User signed up successfully',
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token missing',
    });
  }

  const refreshToken = authorization.split(' ')[1];

  const result = await AuthService.refreshToken(refreshToken as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Token refreshed successfully',
    data: result,
  });
});

export const AuthController = {
  signupUser,
  loginUser,
  refreshToken,
};
