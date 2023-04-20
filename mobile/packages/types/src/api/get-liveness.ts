import { Liveness } from '../data';

export type GetLivenessRequest = {
  id: string;
};

export type GetLivenessResponse = Liveness[];
