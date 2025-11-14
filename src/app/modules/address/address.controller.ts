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

export const AddressController = {
  insertIntoDB,
};
