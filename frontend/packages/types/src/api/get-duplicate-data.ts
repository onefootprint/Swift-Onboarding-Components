import type { OtherTenantsDuplicateDataSummary, SameTenantDuplicateData } from '../data';

export type GetDuplicateDataRequest = {
  id: string;
};

export type GetDuplicateDataResponse = {
  sameTenant: SameTenantDuplicateData;
  otherTenant?: OtherTenantsDuplicateDataSummary;
};
