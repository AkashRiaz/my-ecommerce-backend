import express from 'express';
import { InventoryController } from './inventory.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../enums/user';
const router = express.Router();

router.post(
  '/variant/:variantId/adjust',
  auth(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.INVENTORY_MANAGER,
    UserRole.CUSTOMER,
  ),
  InventoryController.adjustInventory,
);

router.get(
  '/variant/:variantId',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INVENTORY_MANAGER),
  InventoryController.getInventoryByVariant,
);

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INVENTORY_MANAGER),
  InventoryController.getAllInventory,
);

router.get(
  '/movements',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INVENTORY_MANAGER),
  InventoryController.getMovements,
);

export const InventoryRoute = router;
