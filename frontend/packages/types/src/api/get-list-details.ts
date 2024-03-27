import type { ListEntry } from '../data';

export type GetListEntriesRequest = {
  listId: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type GetListEntriesResponse = ListEntry[];
