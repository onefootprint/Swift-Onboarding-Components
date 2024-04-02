import type { ListTimeline } from '../data';

export type GetListTimelineRequest = {
  id: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type GetListTimelineResponse = ListTimeline;
