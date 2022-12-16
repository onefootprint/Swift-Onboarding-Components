import {
  DecryptedUserDataAttributes,
  UserDataAttribute,
} from '@onefootprint/types';

import { UserVaultData } from '../../types';

const syncVaultWithDecryptedData = (
  data: DecryptedUserDataAttributes,
  vaultData?: UserVaultData,
) => {
  const syncedVaultData = vaultData || {
    kycData: {},
    idDoc: {},
  };

  const keys = Object.keys(data) as UserDataAttribute[];
  keys.forEach(key => {
    const value = data[key];
    if (value !== undefined) {
      syncedVaultData.kycData[key] = value;
    }
  });

  return syncedVaultData;
};

export default syncVaultWithDecryptedData;
