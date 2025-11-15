import prisma from '../../../shared/prisma';
import { UserUpdateProfileInput } from './user.interface';

const getAllUserProfiles = async () => {
  const result = await prisma.user.findMany({
    include: {
      sessions: true,
      addresses: true,
      roles: {
        include: {
          role: true,
        }
      }
    },
  });
  return result;
};

const getUserProfile = async (userId: number) => {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      sessions: true,
      addresses: true,
      roles: {
        include: {
          role: true,
        }
      }
    },
  });

  return result;
};

const updateProfile = async (
  userId: number,
  payload: UserUpdateProfileInput,
) => {
  const result = await prisma.user.update({
    where: { id: userId },
    data: payload,
  });
  return result;
};

const deleteUserProfile = async (userId: number) => {
  const result = await prisma.user.delete({
    where: { id: userId },
  });

  return result;
};

export const UserService = {
  getUserProfile,
  getAllUserProfiles,
  updateProfile,
  deleteUserProfile,
};
