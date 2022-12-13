import { Timeline } from '../data';

export type GetTimelineRequest = {
  userId: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type GetTimelineResponse = Timeline;
