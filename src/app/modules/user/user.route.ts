import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../enums/user';

const router = express.Router();

router.get(
  '/profiles',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CUSTOMER),
  UserController.getAllUserProfiles,
);
router.get(
  '/profile/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CUSTOMER),
  UserController.getUserProfile,
);
router.patch(
  '/profile/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CUSTOMER),
  UserController.updateUserProfile,
);
router.delete(
  '/profile/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CUSTOMER),
  UserController.deleteUserProfile,
);

export const UserRouter = router;
