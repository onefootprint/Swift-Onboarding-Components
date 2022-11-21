import { PinnedAnnotation } from '../data/pinned-annotation';

export type GetPinnedAnnotationsRequest = {
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
  userId: string | string[];
};

export type GetPinnedAnnotationsResponse = PinnedAnnotation[];
