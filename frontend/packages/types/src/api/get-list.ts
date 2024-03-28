import type { ListDetails } from '../data/list';

export type GetListDetailsRequest = {
  id: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type GetListDetailsResponse = ListDetails;
