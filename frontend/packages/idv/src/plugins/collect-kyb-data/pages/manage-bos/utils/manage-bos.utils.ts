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
  const allEmails = [
    ...existingOwners.map(owner => owner.decryptedData[IdDI.email]).filter(Boolean),
    ...newOwners.map(owner => owner.email).filter(Boolean),
  ];
  return allEmails.length > 0 && new Set(allEmails).size !== allEmails.length;
};

export const hasDuplicatedPhoneNumber = (
  existingOwners: HostedBusinessOwner[],
  newOwners: NewBusinessOwner[],
): boolean => {
  const allPhoneNumbers = [
    ...existingOwners.map(owner => owner.decryptedData[IdDI.phoneNumber]).filter(Boolean),
    ...newOwners.map(owner => owner.phoneNumber).filter(Boolean),
  ];
  return allPhoneNumbers.length > 0 && new Set(allPhoneNumbers).size !== allPhoneNumbers.length;
};
