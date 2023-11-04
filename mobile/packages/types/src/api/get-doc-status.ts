import type { IdDocBadImageError } from '../data';

export type GetDocStatusRequest = {
  authToken: string;
};

export enum DocStatusKind {
  pending = 'pending',
  complete = 'complete',
  error = 'error',
  retryLimitExceeded = 'retry_limit_exceeded',
}

export type GetDocStatusResponse = {
  status: { kind: DocStatusKind };
  errors?: IdDocBadImageError[];
};
