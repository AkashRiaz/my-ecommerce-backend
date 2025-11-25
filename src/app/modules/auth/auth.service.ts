import { StringValue } from 'ms';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { ILoginUser, IRefreshTokenResponse, IUser } from './auth.interface';
import { comparePassword, hashPassword } from './auth.utils';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';
import { UserRole } from '../../../enums/user';

const signupUser = async (payload: IUser) => {
  const { email, password, name, phone } = payload;

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email already exists',
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone,
    },
    include:{
      roles:{
        include:{
          role:true
        }
      }
    }
  });

  // 2️⃣ Find role CUSTOMER by enum
  const customerRole = await prisma.role.findUnique({
    where: { name: UserRole.CUSTOMER },
  });

  // 3️⃣ Assign role
  await prisma.userRole.create({
    data: {
      userId: user?.id,
      roleId: customerRole!.id,
    },
  });

  return user;
};

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const isExist = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  const roles = isExist.roles.map(r => r.role.name);
  if (
    isExist.passwordHash &&
    !(await comparePassword(password, isExist.passwordHash))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  const { id: userId } = isExist;
  const accessToken = jwtHelpers.createToken(
    {
      userId,
      roles: roles, // ARRAY OF ROLES
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as StringValue,
  );

  const refreshToken = jwtHelpers.createToken(
    { userId },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as StringValue,
  );

  const hashedRefreshToken = await hashPassword(refreshToken);

  await prisma.session.create({
    data: {
      userId,
      refreshToken: hashedRefreshToken,
      ip: '',
      userAgent: '', // <-- optional (or req.headers['user-agent'])
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000), // 7 days
    },
  });

  return {
    accessToken,
    refreshToken,
  };
  // // Signin logic to be implemented
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  let verifiedToken = null;

  console.log(token, 'token-----------');

  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret,
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }

  const { userId } = verifiedToken;

  // tumi delete hye gso  kintu tumar refresh token ase
  // checking deleted user's refresh token

  const isUserExist = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  console.log(isUserExist, 'is user exist');

  const newAccessToken = jwtHelpers.createToken(
    { userId: isUserExist?.id },
    config.jwt.secret as Secret,
    config.jwt.expires_in as StringValue,
  );

  return { accessToken: newAccessToken };

};

export const AuthService = {
  signupUser,
  loginUser,
  refreshToken,
};
