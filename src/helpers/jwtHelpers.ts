import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { StringValue } from 'ms';

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: StringValue
) => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, secret, options);
};



const createResetToken = (
  payload: any,
  secret: Secret,
  expireTime: string
): string => {
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: expireTime,
  });
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};


export const jwtHelpers = {
  createToken,
  verifyToken,
  createResetToken
};