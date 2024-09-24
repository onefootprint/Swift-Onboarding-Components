import type { AccessEvent } from '../data/access-event';

export type GetAccessEventsRequest = {
  cursor?: string;
  search?: string;
  targets?: string[];
  timestamp_gte?: string; // from
  timestamp_lte?: string; // to
};

export type GetAccessEventsResponse = AccessEvent[];
