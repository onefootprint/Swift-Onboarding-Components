import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, UserVaultData } from 'src/pages/users/users.types';

const getVaultDataOrCreate = async (queryClient: QueryClient, user: User) => {
  const getFromCache = () =>
    queryClient.getQueryData<UserVaultData>(['user', user.id, 'vaultData']);

  // TODO:
  // https://linear.app/footprint/issue/FP-2909/add-new-format-for-attributes-in-onboarding
  const createInitialData = () => {
    const idDoc: UserVaultData['idDoc'] = {};
    const kycData: UserVaultData['kycData'] = {};
    const investorProfile: UserVaultData['investorProfile'] = {};

    const docTypes = user.identityDocumentInfo.map(info => info.type);
    Object.values(docTypes).forEach(attribute => {
      idDoc[attribute] = null;
    });
    Object.values(user.identityDataAttributes).forEach(attribute => {
      kycData[attribute] = null;
    });
    return { kycData, idDoc, investorProfile };
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
