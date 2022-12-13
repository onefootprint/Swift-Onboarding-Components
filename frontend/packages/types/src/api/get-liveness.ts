import { Liveness } from '../data';

export type GetLivenessRequest = {
  userId: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type GetLivenessResponse = Liveness[];
