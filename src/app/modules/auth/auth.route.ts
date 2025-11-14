import express from 'express';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post('/singup', AuthController.signupUser);
router.post('/login', AuthController.loginUser);
router.post(
  '/refresh-token',
  AuthController.refreshToken
);

export const AuthRouter = router;