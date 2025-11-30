import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { InventoryService } from './inventory.service';

const adjustInventory = catchAsync(async (req, res) => {
  const variantId = Number(req.params.variantId);
  const payload = req.body;

  const result = await InventoryService.adjustInventory(variantId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inventory adjusted successfully',
    data: result,
  });
});

const getInventoryByVariant = catchAsync(async (req, res) => {
  const variantId = Number(req.params.variantId);
  const withMovements = req.query.withMovements === 'true';
  const result = await InventoryService.getInventoryByVariant(
    variantId,
    withMovements,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inventory fetched successfully',
    data: result,
  });
});

const getAllInventory = catchAsync(async (req, res) => {
  const result = await InventoryService.getAllInventory();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All inventory fetched successfully',
    data: result,
  });
});

const getMovements = catchAsync(async (req, res) => {
  const result = await InventoryService.getMovements();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inventory movements fetched successfully',
    data: result,
  });
});

export const InventoryController = {
  adjustInventory,
  getInventoryByVariant,
  getAllInventory,
  getMovements,
};
