import { IdScanBadImageError } from '../data';

export type GetDocStatusRequest = {
  authToken: string;
  tenantPk: string;
};

export enum DocStatusType {
  pending = 'pending',
  complete = 'complete',
  error = 'error',
  retryLimitExceeded = 'retry_limit_exceeded',
}

export type GetDocStatusResponse = {
  status: DocStatusType;
  frontImageError?: IdScanBadImageError;
  backImageError?: IdScanBadImageError;
};
