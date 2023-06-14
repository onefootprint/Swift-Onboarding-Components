import { CardDI } from '../data/di';

export type UsersVaultRequest = {
  authToken: string;
  data: Partial<Record<CardDI, string>>;
};

export type UsersVaultResponse = {};
