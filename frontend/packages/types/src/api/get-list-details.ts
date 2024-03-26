export type GetListEntriesRequest = {
  listId: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type GetListEntriesResponse = string[];
