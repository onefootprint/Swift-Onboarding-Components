import constate from 'constate';
import { useMap } from 'usehooks-ts';

import { User, UserMetadata } from '../use-user/types';
import syncVaultWithMetadata from './utils/sync-vault-with-metadata/sync-vault-with-metadata';

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
      if (key === 'metadata') {
        const metadata = value as UserMetadata;
        // If there are new user fields, need to add them as "encrypted fields" to the vault
        const syncedVaultData = syncVaultWithMetadata(metadata, user.vaultData);
        user.vaultData = syncedVaultData;
        user.metadata = metadata;
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
