import { IdDI, IdDocDI, InvestorProfileDI } from '@onefootprint/types';

export type FormData = {
  id: Partial<Record<IdDI, boolean>>;
  id_document: Partial<Record<IdDocDI, boolean>>;
  investor_profile: Partial<Record<InvestorProfileDI, boolean>>;
};
