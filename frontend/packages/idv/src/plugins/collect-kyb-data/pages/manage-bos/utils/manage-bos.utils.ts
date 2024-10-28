import type { HostedBusinessOwner } from '@onefootprint/services';
import { IdDI } from '@onefootprint/types';
import type { ManageBosFormData } from '../manage-bos.types';

const overlayUpdates = (existingOwners: HostedBusinessOwner[], { bos, bosToDelete }: ManageBosFormData) => {
  const existingOwnersAfterDelete = existingOwners.filter(bo => !bosToDelete.includes(bo.uuid));
  const allOwnersByUuid = {
    ...Object.fromEntries(existingOwnersAfterDelete.map(owner => [owner.uuid, owner])),
    ...Object.fromEntries(bos.map(owner => [owner.uuid, owner])),
  };
  return allOwnersByUuid;
};

export const sumTotalOwnershipStake = (
  existingOwners: HostedBusinessOwner[],
  { bos, bosToDelete }: ManageBosFormData,
): number => {
  const allOwnersByUuid = overlayUpdates(existingOwners, { bos, bosToDelete });
  const totalStake = Object.values(allOwnersByUuid)
    .map(bo => bo.ownershipStake ?? 0)
    .reduce((sum, stake) => sum + stake, 0);
  return totalStake;
};

// TODO it's fine to have duplicates in sandbox
export const hasDuplicatedEmail = (
  existingOwners: HostedBusinessOwner[],
  { bos, bosToDelete }: ManageBosFormData,
): boolean => {
  const existingOwnersAfterDelete = existingOwners.filter(bo => !bosToDelete.includes(bo.uuid));
  const allEmailsByUuid = {
    ...Object.fromEntries(existingOwnersAfterDelete.map(owner => [owner.uuid, owner.decryptedData[IdDI.email]])),
    ...Object.fromEntries(bos.map(owner => [owner.uuid, owner.email])),
  };
  const allEmails = Object.values(allEmailsByUuid).filter(Boolean);
  return allEmails.length > 0 && new Set(allEmails).size !== allEmails.length;
};

export const hasDuplicatedPhoneNumber = (
  existingOwners: HostedBusinessOwner[],
  { bos, bosToDelete }: ManageBosFormData,
): boolean => {
  const removeSpecialChars = (phone: string) => phone.replace(/\D/g, '');

  const existingOwnersAfterDelete = existingOwners.filter(bo => !bosToDelete.includes(bo.uuid));
  const allPhoneNumbersByUuid = {
    ...Object.fromEntries(existingOwnersAfterDelete.map(owner => [owner.uuid, owner.decryptedData[IdDI.phoneNumber]])),
    ...Object.fromEntries(bos.map(owner => [owner.uuid, owner.phoneNumber])),
  };
  const allPhoneNumbers = Object.values(allPhoneNumbersByUuid).filter(Boolean).map(removeSpecialChars);
  return allPhoneNumbers.length > 0 && new Set(allPhoneNumbers).size !== allPhoneNumbers.length;
};
