import { IdScanBadImageError } from '../data';

export type GetDocStatusRequest = {
  authToken: string;
  tenantPk: string;
};

export type GetDocStatusResponse = {
  status: 'pending' | 'complete';
  frontImageError?: IdScanBadImageError;
  backImageError?: IdScanBadImageError;
};
