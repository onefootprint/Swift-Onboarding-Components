import { IdDocDataAttribute, UserDataAttribute } from '@onefootprint/types';
import constate from 'constate';
import { UserVaultData } from 'src/hooks/use-user';
import { useMap } from 'usehooks-ts';

// Maintains state on decrypted user attributes
const useUserDataImpl = () => {
  const [userVaults, { set }] = useMap<String, UserVaultData>(new Map());
  const updateUserVault = (userId: string, newData: UserVaultData) => {
    const entry = userVaults.get(userId) || {
      kycData: {},
      idDoc: {},
    };
    const user = { ...entry };
    const { kycData, idDoc } = newData;

    const kycKeys = Object.keys(kycData) as UserDataAttribute[];
    kycKeys.forEach(key => {
      const value = kycData[key];
      const attrKey = (UserDataAttribute as any)[key] as UserDataAttribute;
      if (value !== undefined) {
        user.kycData[attrKey] = value;
      }
    });

    if (idDoc) {
      const updatedIdDoc = idDoc ?? {};
      const idDocKeys = Object.keys(idDoc) as IdDocDataAttribute[];
      idDocKeys.forEach(key => {
        const value = idDoc[key];
        const attrKy = (IdDocDataAttribute as any)[key] as IdDocDataAttribute;
        if (value !== undefined) {
          updatedIdDoc[attrKy] = value;
        }
      });
      user.idDoc = updatedIdDoc;
    }

    set(userId, user);
  };

  return {
    userVaults,
    updateUserVault,
  };
};

// Create a singleton of this hook that is reused by all invocations. This allows data to be shared
// across multiple invocations of this hook.
const [Provider, useUserData] = constate(useUserDataImpl);
export default useUserData;
export const UserDataProvider = Provider;
