import type { List } from '../data/list';

export type GetListRequest = {
  id: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type GetListResponse = List;
