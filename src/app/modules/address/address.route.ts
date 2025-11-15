import express from 'express';
import { AddressController } from './address.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/address',auth(), AddressController.insertIntoDB);
router.get('/addresses', AddressController.getAllUserAddress);
router.get('/address/:id', auth(), AddressController.getSingleUserAddress);
router.patch('/address/:id', auth(), AddressController.updateUserAddress);
router.delete('/address/:id', auth(), AddressController.deleteUserAddress);

export const AddressRouter = router;