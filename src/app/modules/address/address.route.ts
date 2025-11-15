import express from 'express';
import { AddressController } from './address.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../enums/user';

const router = express.Router();

router.post(
  '/address',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AddressController.insertIntoDB,
);
router.get(
  '/addresses',
  auth(UserRole.SUPER_ADMIN),
  AddressController.getAllUserAddress,
);
router.get(
  '/address/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AddressController.getSingleUserAddress,
);
router.patch(
  '/address/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AddressController.updateUserAddress,
);
router.delete(
  '/address/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AddressController.deleteUserAddress,
);

export const AddressRouter = router;
