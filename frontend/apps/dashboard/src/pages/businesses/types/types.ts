import {
  BusinessDataAttribute,
  BusinessStatus,
  ScopedBusiness,
} from '@onefootprint/types';

export type Business = ScopedBusiness & {
  requiresManualReview: boolean;
  status: BusinessStatus;
};

export type BusinessVaultData = {
  kybData: Partial<Record<BusinessDataAttribute, KybDataValue>>;
};

export type BusinessWithVaultData = Business & { vaultData: BusinessVaultData };

export type KybDataValue = string | null; // Null value means encrypted
