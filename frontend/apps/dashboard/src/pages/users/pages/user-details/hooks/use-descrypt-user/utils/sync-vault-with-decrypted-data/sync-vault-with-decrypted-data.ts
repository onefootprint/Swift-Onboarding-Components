import {
  IdDocType,
  InvestorProfileDataAttribute,
  UserDataAttribute,
} from '@onefootprint/types';
import { UserVaultData } from 'src/pages/users/users.types';

const syncVaultWithDecryptedData = (
  decryptedVaultData: UserVaultData,
  vaultData?: UserVaultData,
) => {
  const syncedVaultData = vaultData || {
    kycData: {},
    idDoc: {},
    investorProfile: {},
  };
  const { kycData, idDoc, investorProfile } = decryptedVaultData;

  Object.entries(kycData).forEach(([attr, value]) => {
    if (value !== undefined && value !== null) {
      // Even if it is an empty string, save it to the vault data
      syncedVaultData.kycData[attr as UserDataAttribute] = value;
    }
  });
  Object.entries(idDoc).forEach(([attr, value]) => {
    if (value) {
      syncedVaultData.idDoc[attr as IdDocType] = value;
    }
  });
  Object.entries(investorProfile).forEach(([attr, value]) => {
    if (value !== undefined && value !== null) {
      syncedVaultData.investorProfile[attr as InvestorProfileDataAttribute] =
        value;
    }
  });
  return syncedVaultData;
};

export default syncVaultWithDecryptedData;
