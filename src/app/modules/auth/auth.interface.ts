// user.interface.ts
export type IUser = {
  id: number;
  email: string;
  name?: string | null;
  password: string;
  phone?: string | null;
  status: UserStatus;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // relations
//   addresses?: any[];
//   sessions?: any[];
//   roles?: any[];
}

export type ILoginUser = {
    email: string;
    password: string;
}

export type IRefreshTokenResponse = {
  accessToken: string;
};


export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}