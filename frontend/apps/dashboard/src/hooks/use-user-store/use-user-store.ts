import constate from 'constate';
import { useMap } from 'usehooks-ts';

import { User, UserVaultData } from '../use-user/types';

type MergeArgs = {
  userId: string;
  data: User;
};

const useUserStoreImpl = () => {
  const [usersMap, { set, reset }] = useMap<string, User>(new Map());

  const get = (userId: string): User | undefined => usersMap.get(userId);

  const getAll = (): User[] => Array.from(usersMap.values());

  const clear = () => reset();

  const mergeAll = (users: MergeArgs[]) => {
    users.forEach(user => merge(user));
  };

  const merge = (args: MergeArgs) => {
    const { userId, data } = args;
    const user = usersMap.get(userId) ?? ({} as User);

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'vaultData') {
        if (!user.vaultData) {
          user.vaultData = {
            kycData: {},
            idDoc: {},
          };
        }
        const { kycData, idDoc } = value as UserVaultData;
        user.vaultData.kycData = {
          ...user.vaultData.kycData,
          ...kycData,
        };
        user.vaultData.idDoc = {
          ...user.vaultData.idDoc,
          ...idDoc,
        };
      } else {
        (user as any)[key] = value;
      }
    });

    set(userId, user);
  };

  return { getAll, get, merge, mergeAll, clear };
};

const [Provider, useUserStore] = constate(useUserStoreImpl);
export const UserStoreProvider = Provider;
export default useUserStore;
