import { IdDocBadImageError } from '../data';

export type GetDocStatusRequest = {
  authToken: string;
  documentRequestId: string;
};

export enum DocStatusKind {
  pending = 'pending',
  complete = 'complete',
  error = 'error',
  retryLimitExceeded = 'retry_limit_exceeded',
}

export type GetDocStatusResponse = {
  status: { kind: DocStatusKind };
  frontImageError?: IdDocBadImageError;
  backImageError?: IdDocBadImageError;
};
