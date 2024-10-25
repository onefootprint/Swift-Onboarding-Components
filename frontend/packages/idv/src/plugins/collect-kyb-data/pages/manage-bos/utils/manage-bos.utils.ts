import type { HostedBusinessOwner } from '@onefootprint/services';
import { IdDI } from '@onefootprint/types';
import type { NewBusinessOwner } from '../manage-bos.types';

export const isOwnershipStakeInvalid = (
  existingOwners: HostedBusinessOwner[],
  newOwners: NewBusinessOwner[],
): boolean => {
  const existingOwnersStake = existingOwners.reduce((sum, owner) => sum + (owner?.ownershipStake ?? 0), 0);
  const newOwnersStake = newOwners.reduce((sum, owner) => sum + (owner.ownershipStake ?? 0), 0);
  const totalStake = existingOwnersStake + newOwnersStake;
  return totalStake > 100;
};

export const hasDuplicatedEmail = (existingOwners: HostedBusinessOwner[], newOwners: NewBusinessOwner[]): boolean => {
  const allEmailsByUuid = {
    ...Object.fromEntries(existingOwners.map(owner => [owner.uuid, owner.decryptedData[IdDI.email]])),
    ...Object.fromEntries(newOwners.map(owner => [owner.uuid, owner.email])),
  };
  const allEmails = Object.values(allEmailsByUuid).filter(Boolean);
  return allEmails.length > 0 && new Set(allEmails).size !== allEmails.length;
};

export const hasDuplicatedPhoneNumber = (
  existingOwners: HostedBusinessOwner[],
  newOwners: NewBusinessOwner[],
): boolean => {
  const removeSpecialChars = (phone: string) => phone.replace(/\D/g, '');

  const allPhoneNumbersByUuid = {
    ...Object.fromEntries(existingOwners.map(owner => [owner.uuid, owner.decryptedData[IdDI.phoneNumber]])),
    ...Object.fromEntries(newOwners.map(owner => [owner.uuid, owner.phoneNumber])),
  };
  const allPhoneNumbers = Object.values(allPhoneNumbersByUuid).filter(Boolean).map(removeSpecialChars);
  return allPhoneNumbers.length > 0 && new Set(allPhoneNumbers).size !== allPhoneNumbers.length;
};
