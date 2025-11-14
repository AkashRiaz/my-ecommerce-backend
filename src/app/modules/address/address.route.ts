import express from 'express';
import { AddressController } from './address.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/address',auth(), AddressController.insertIntoDB);

export const AddressRouter = router;