import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, UserVaultData } from 'src/pages/users/users.types';

const getVaultDataOrCreate = async (queryClient: QueryClient, user: User) => {
  const getFromCache = () =>
    queryClient.getQueryData<UserVaultData>(['user', user.id, 'vaultData']);

  const createInitialData = () => {
    const idDoc: UserVaultData['idDoc'] = {};
    const docTypes = user.identityDocumentInfo.map(info => info.type);
    Object.values(docTypes).forEach(attribute => {
      idDoc[attribute] = null;
    });
    const kycData: UserVaultData['kycData'] = {};
    Object.values(user.identityDataAttributes).forEach(attribute => {
      kycData[attribute] = null;
    });
    return { kycData, idDoc };
  };

  const possibleData = await getFromCache();
  return possibleData || createInitialData();
};

const useUserVault = (userId: string, user?: User) => {
  const queryClient = useQueryClient();

  const update = (newVaultData: UserVaultData) => {
    queryClient.setQueryData(['user', userId, 'vaultData'], newVaultData);
  };

  const userVaultQuery = useQuery<UserVaultData>(
    ['user', userId, 'vaultData'],
    () => getVaultDataOrCreate(queryClient, user as User),
    { enabled: !!user },
  );

  return { ...userVaultQuery, update };
};

export default useUserVault;
