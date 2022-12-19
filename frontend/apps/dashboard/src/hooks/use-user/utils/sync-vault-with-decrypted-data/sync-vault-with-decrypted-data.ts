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

  const keys = Object.keys(
    data,
  ) as unknown as (keyof DecryptedUserDataAttributes)[];
  keys.forEach(key => {
    const value = data[key];
    if (value !== undefined) {
      const attrKey = (UserDataAttribute as any)[key] as UserDataAttribute;
      syncedVaultData.kycData[attrKey] = value;
    }
  });

  return syncedVaultData;
};

export default syncVaultWithDecryptedData;
