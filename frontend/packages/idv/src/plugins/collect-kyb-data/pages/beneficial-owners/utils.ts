import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import type { BeneficialOwner } from '@onefootprint/types';

export const getTotalOwnershipStake = (beneficialOwners: BeneficialOwner[]): number => {
  return beneficialOwners
    .map(bo => Number(bo[BeneficialOwnerDataAttribute.ownershipStake]))
    .reduce((total, stake) => total + stake, 0);
};
