import { UserDataAttribute } from '@onefootprint/types';

import { DataValue, UserVaultData } from '../../types/vault-data.types';

const getFullNameDataValue = (
  attributes: UserVaultData,
): DataValue | undefined => {
  const { kycData } = attributes;
  const firstName = kycData[UserDataAttribute.firstName];
  const lastName = kycData[UserDataAttribute.lastName];
  if (firstName === undefined && lastName === undefined) {
    return undefined;
  }
  const names = [firstName, lastName].filter(name => name?.length);
  return names.length ? names.join(' ') : null;
};

export default getFullNameDataValue;
