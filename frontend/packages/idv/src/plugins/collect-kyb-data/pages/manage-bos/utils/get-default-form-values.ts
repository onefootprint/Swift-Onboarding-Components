import type { BootstrapBusinessData, UserData } from '@/idv/types';
import { uuidv4 } from '@onefootprint/dev-tools';
import type { HostedBusinessOwner } from '@onefootprint/request-types';
import {
  BeneficialOwnerDataAttribute,
  BootstrapOnlyBusinessPrimaryOwnerStake,
  BootstrapOnlyBusinessSecondaryOwnersKey,
  IdDI,
} from '@onefootprint/types';
import type { NewBusinessOwner } from '../manage-bos.types';

const getDefaultFormValues = (
  existingBos: HostedBusinessOwner[],
  bootstrapBusinessData: BootstrapBusinessData,
  bootstrapUserData: UserData,
) => {
  // First, take all "mutable" BOs from the backend and insert them into the list of default form values.
  // This includes the primary BO during a new business onboarding.
  const defaultBos: NewBusinessOwner[] = existingBos
    .filter(bo => bo.isMutable)
    .map(bo => {
      let bootstrappedPrimaryOwnerFields: Partial<NewBusinessOwner> = {};
      if (bo.isAuthedUser) {
        bootstrappedPrimaryOwnerFields = {
          ownershipStake: bootstrapBusinessData[BootstrapOnlyBusinessPrimaryOwnerStake]?.value,
          firstName: bootstrapUserData[IdDI.firstName]?.value,
          lastName: bootstrapUserData[IdDI.lastName]?.value,
        };
      }
      return {
        uuid: bo.uuid,
        email: bo.decryptedData[IdDI.email],
        phoneNumber: bo.decryptedData[IdDI.phoneNumber],
        // For some fields, overlay bootstrapped data for the primary owner, if available
        firstName: bootstrappedPrimaryOwnerFields.firstName || bo.decryptedData[IdDI.firstName],
        lastName: bootstrappedPrimaryOwnerFields.lastName || bo.decryptedData[IdDI.lastName],
        ownershipStake: bootstrappedPrimaryOwnerFields.ownershipStake || bo.ownershipStake,
      };
    });

  const isOnlyAuthedUser = existingBos.every(bo => bo.isAuthedUser);
  if (isOnlyAuthedUser) {
    // Then, add any bootstrapped secondary BOs if we are making a new business and there are no other BOs
    // on the backend
    bootstrapBusinessData[BootstrapOnlyBusinessSecondaryOwnersKey]?.value.forEach(bo => {
      defaultBos.push({
        uuid: uuidv4(),
        firstName: bo[BeneficialOwnerDataAttribute.firstName],
        lastName: bo[BeneficialOwnerDataAttribute.lastName],
        ownershipStake: bo[BeneficialOwnerDataAttribute.ownershipStake],
        email: bo[BeneficialOwnerDataAttribute.email],
        phoneNumber: bo[BeneficialOwnerDataAttribute.phoneNumber],
      });
    });
  }
  return defaultBos;
};

export default getDefaultFormValues;
