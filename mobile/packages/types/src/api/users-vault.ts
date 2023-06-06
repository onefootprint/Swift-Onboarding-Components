import { CardDI } from '../data';

export type UsersVaultRequest = {
  authToken: string;
  cardName: string;
  data: Partial<Record<CardDI, string>>;
};

export type UsersVaultResponse = {};
