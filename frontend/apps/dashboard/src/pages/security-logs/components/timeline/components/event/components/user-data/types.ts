import type { DataIdentifier } from '@onefootprint/request-types/dashboard';

export type FinancialDataItem = {
  name: string;
  fields: DataIdentifier[];
};
