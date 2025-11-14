import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/profiles', UserController.getAllUserProfiles);
router.get('/profile/:id',auth(), UserController.getUserProfile);
router.patch('/profile/:id',auth(), UserController.updateUserProfile);
router.delete('/profile/:id',auth(), UserController.deleteUserProfile);

export const UserRouter = router;