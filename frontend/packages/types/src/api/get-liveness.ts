import type { AuthEvent } from '../data';

export type GetLivenessRequest = {
  id: string;
};

export type GetLivenessResponse = AuthEvent[];
