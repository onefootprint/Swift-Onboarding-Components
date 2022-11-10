import { IdDocBadImageError } from '../data';

export type GetDocStatusRequest = {
  authToken: string;
  tenantPk: string;
  documentRequestId: string;
};

export enum DocStatusType {
  pending = 'pending',
  complete = 'complete',
  error = 'error',
  retryLimitExceeded = 'retry_limit_exceeded',
}

export type GetDocStatusResponse = {
  status: DocStatusType;
  frontImageError?: IdDocBadImageError;
  backImageError?: IdDocBadImageError;
};
