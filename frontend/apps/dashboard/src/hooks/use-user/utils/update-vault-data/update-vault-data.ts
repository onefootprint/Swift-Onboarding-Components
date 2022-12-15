import {
  DecryptedUserDataAttributes,
  UserDataAttribute,
} from '@onefootprint/types';
import { User } from 'src/hooks/use-user/types';

const updateVaultData = (user: User, data: DecryptedUserDataAttributes) => {
  const keys = Object.keys(data) as UserDataAttribute[];
  const vaultData = user.vaultData || {
    kycData: {},
    idDoc: {},
  };

  keys.forEach(key => {
    const value = data[key];
    const attrKey = (UserDataAttribute as any)[key] as UserDataAttribute;
    if (value !== undefined) {
      vaultData.kycData[attrKey] = value;
    }
  });

  return vaultData;
};

export default updateVaultData;
