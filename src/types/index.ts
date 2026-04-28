import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

export interface IStreamingAccount {
  youtube?: {
    channelId: string;
    channelName: string;
    isVerified: boolean;
    verifiedAt?: Date;
  };
  twitch?: {
    username: string;
    channelId: string;
    isVerified: boolean;
    verifiedAt?: Date;
  };
}

export enum Currency {
  NGN = 'NGN',
  USD = 'USD'
}

export interface IWalletBalance {
  currency: Currency;
  balance: number;
}

export interface IGameRank {
  gameId: string;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  totalEarnings: number;
}

export interface IOAuthProvider {
  google?: {
    id: string;
    email: string;
  };
  twitch?: {
    id: string;
    username: string;
  };
}

export interface IUser {
  _id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  oauthProviders: IOAuthProvider;
  streamingAccounts: IStreamingAccount;
  wallets: IWalletBalance[];
  rankings: IGameRank[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface JWTPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export enum GameCategory {
  MOBILE = 'mobile',
  CONSOLE = 'console',
  PC = 'pc'
}

export interface IGame {
  _id: string;
  name: string;
  description: string;
  category: GameCategory;
  platforms: string[];
  imageUrl?: string;
  isActive: boolean;
  rules: string[];
  metadata: {
    minPlayers: number;
    maxPlayers: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
