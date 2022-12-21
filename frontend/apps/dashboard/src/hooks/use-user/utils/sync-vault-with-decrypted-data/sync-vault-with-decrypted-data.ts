import { IdDocType, UserDataAttribute } from '@onefootprint/types';

import { UserVaultData } from '../../types';

const syncVaultWithDecryptedData = (
  decryptedVaultData: UserVaultData,
  vaultData?: UserVaultData,
) => {
  const syncedVaultData = vaultData || {
    kycData: {},
    idDoc: {},
  };
  const { kycData, idDoc } = decryptedVaultData;

  Object.entries(kycData).forEach(([userDataAttr, kycDataValue]) => {
    if (kycDataValue !== undefined && kycDataValue !== null) {
      // Even if it is an empty string, save it to the vault data
      syncedVaultData.kycData[userDataAttr as UserDataAttribute] = kycDataValue;
    }
  });

  Object.entries(idDoc).forEach(([idDocType, idDocDataValue]) => {
    if (idDocDataValue) {
      syncedVaultData.idDoc[idDocType as IdDocType] = idDocDataValue;
    }
  });

  return syncedVaultData;
};

export default syncVaultWithDecryptedData;
