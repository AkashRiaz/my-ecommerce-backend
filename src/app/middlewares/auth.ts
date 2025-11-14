import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import ApiError from '../../errors/ApiError';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import config from '../../config';

const auth =
  () =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const token = req.headers.authorization;
      console.log('Auth Token:', token);
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }
      // verify token
      let verifiedUser = null;

      verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret);

      console.log('Verified User:', verifiedUser);

       req.user = verifiedUser;

       console.log('Request User Set To:', req.user);

       if(!verifiedUser){
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token or user not verified');
       }


      // role diye guard korar jnno
    //   if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
    //     throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    //   }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;