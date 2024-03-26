import type { Actor } from '../data';

export type GetListDetailsRequest = {
  listId: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type GetListDetailsResponse = {
  actor: Actor;
  createdAt: string;
  id: string;
  data: {
    entries: string[];
  };
};
