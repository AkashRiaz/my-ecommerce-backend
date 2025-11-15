import prisma from '../../../shared/prisma';
import { IAddress } from './address.interface';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

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

const getSingleUserAddress = async (
  addressId: number,
  userId: number,
  roles: string[],
) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
    include: { user: true },
  });

  if (!address) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  }

  // Admins can see anyone's address
  if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
    return address;
  }

  // Customers → only their own
  if (address.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  return address;
};

const updateUserAddress = async (
  userId: number,
  addressId: number,
  roles: string[],
  payload: IAddress,
) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  }

  // Admin & SuperAdmin can update any address
  if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
    if (address.userId !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }
  }

  return await prisma.address.update({
    where: { id: addressId },
    data: payload,
  });
};

const deleteUserAddress = async (
  addressId: number,
  userId: number,
  roles: string[],
) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  }

  // If customer → deny if not owner
  if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
    if (address.userId !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }
  }

  return await prisma.address.delete({
    where: { id: addressId },
  });
};
export const AddressService = {
  insertIntoDB,
  getAllUserAddress,
  getSingleUserAddress,
  updateUserAddress,
  deleteUserAddress,
};
