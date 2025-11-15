import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import ApiError from '../../errors/ApiError';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import config from '../../config';

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.secret as Secret,
      );

      if (!verifiedUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
      }

      req.user = verifiedUser; // contains { userId, roles }

      // ROLE CHECK
      if (
        requiredRoles.length > 0 &&
        !requiredRoles.some(role => verifiedUser.roles?.includes(role))
      ) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: Insufficient role here');
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;