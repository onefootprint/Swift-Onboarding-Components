import {
  IdDocType,
  InvestorProfileDataAttribute,
  UserDataAttribute,
} from '@onefootprint/types';

export type FormData = {
  kycData: Partial<Record<UserDataAttribute, boolean>>;
  idDoc: Partial<Record<IdDocType, boolean>>;
  investorProfile: Partial<Record<InvestorProfileDataAttribute, boolean>>;
};
