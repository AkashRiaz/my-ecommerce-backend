import prisma from '../../../shared/prisma';
import { IAddress } from './address.interface';
import ApiError from '../../../errors/ApiError';
import httpUrl from 'http-status';

const insertIntoDB = async (userId: number, payload: IAddress) => {
  const result = await prisma.address.create({
    data: {
      userId,
      ...payload,
    },
    include: {
      user: true,
    },
  });

  return result;
};

const getAllUserAddress = async () => {
  const result = await prisma.address.findMany({
    include: {
      user: true,
    },
  });

  return result;
};

const getSingleUserAddress = async (addressId: number, userId: number) => {
  const result = await prisma.address.findUnique({
    where: { id: addressId, userId: userId },
    include: {
      user: true,
    },
  });

  if (!result) {
    throw new ApiError(httpUrl.NOT_FOUND, 'Address not found');
  }

  return result;
};

const updateUserAddress = async (
  userId: number,
  addressId: number,
  payload: IAddress,
) => {
  const result = await prisma.address.update({
    where: { id: addressId, userId: userId },
    data: payload,
    include: {
      user: {
        include: {
          sessions: true,
        },
      },
    },
  });
  return result;
};

const deleteUserAddress = async (addressId: number, userId: number) => {
  const result = await prisma.address.delete({
    where: { id: addressId, userId: userId },
    include: {
      user: true,
    },
  });
  return result;
};

export const AddressService = {
  insertIntoDB,
  getAllUserAddress,
  getSingleUserAddress,
  updateUserAddress,
  deleteUserAddress,
};
