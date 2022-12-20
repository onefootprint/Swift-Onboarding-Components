import { IdDocType, UserDataAttribute } from '@onefootprint/types';
import { UserMetadata, UserVaultData } from 'src/hooks/use-user/types';

// Syncs the decrypted user vault data with the fields from the metadata
const syncVaultWithMetadata = (
  metadata?: UserMetadata,
  vaultData?: UserVaultData,
): UserVaultData => {
  const syncedVaultData: UserVaultData = {
    kycData: {},
    idDoc: {},
  };
  if (metadata) {
    const { identityDataAttributes, identityDocumentTypes } = metadata;
    identityDataAttributes.forEach((attr: UserDataAttribute) => {
      syncedVaultData.kycData[attr] = null;
    });

    identityDocumentTypes.forEach((attr: IdDocType) => {
      syncedVaultData.idDoc[attr] = null;
    });
  }
  if (vaultData) {
    const { kycData, idDoc } = vaultData;
    Object.entries(kycData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        syncedVaultData.kycData[key as UserDataAttribute] = value;
      }
    });

    Object.entries(idDoc).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        syncedVaultData.idDoc[key as IdDocType] = value;
      }
    });
  }

  return syncedVaultData;
};

export default syncVaultWithMetadata;
