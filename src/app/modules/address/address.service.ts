import prisma from '../../../shared/prisma';
import { IAddress } from './address.interface';

const insertIntoDB = async (userId: number, payload: IAddress) => {
  const result = await prisma.address.create({
    data: {
      userId,
      ...payload,
    },
  });

  return result;
};

export const AddressService = {
  insertIntoDB,
};
