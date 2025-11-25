import httpStatus from 'http-status';
import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProductService } from './product.service';

const insertIntoDB = catchAsync(async (req, res) => {
  const result = await ProductService.insertIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const result = await ProductService.getAllProducts();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products retrieved successfully',
    data: result,
  });
});

const getSingleProduct = catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  const result = await ProductService.getSingleProduct(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product retrieved successfully',
    data: result,
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  const result = await ProductService.updateProduct(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  const result = await ProductService.deleteProduct(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product deleted successfully',
    data: result,
  });
});

export const ProductController = {
  insertIntoDB,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
