import type { BeneficialOwner } from '@onefootprint/types';

export type BeneficialOwnerWithMetadata = BeneficialOwner & {
  _uuid: string;
  _isAuthedUser?: boolean;
  _isMutable?: boolean;
};

export type FormData = { beneficialOwners: BeneficialOwnerWithMetadata[] };
