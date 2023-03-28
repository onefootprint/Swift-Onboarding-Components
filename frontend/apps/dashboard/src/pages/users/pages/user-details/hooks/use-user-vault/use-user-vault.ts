import {
  DocumentDI,
  IdDI,
  IdDocDI,
  InvestorProfileDI,
  Vault,
} from '@onefootprint/types';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from 'src/pages/users/users.types';

const getVaultOrCreate = async (queryClient: QueryClient, user: User) => {
  const getFromCache = () =>
    queryClient.getQueryData<Vault>(['user', user.id, 'vault']);

  const createInitialData = () => {
    const vault: Vault = {
      id: {},
      idDoc: {},
      investorProfile: {},
      document: {},
    };
    Object.entries(IdDocDI).forEach(([, attribute]) => {
      if (user.attributes.includes(attribute)) {
        vault.idDoc[attribute] = null;
      }
    });
    Object.entries(IdDI).forEach(([, attribute]) => {
      if (user.attributes.includes(attribute)) {
        vault.id[attribute] = null;
      }
    });
    Object.entries(InvestorProfileDI).forEach(([, attribute]) => {
      if (user.attributes.includes(attribute)) {
        vault.investorProfile[attribute] = null;
      }
    });
    Object.entries(DocumentDI).forEach(([, attribute]) => {
      if (user.attributes.includes(attribute)) {
        vault.document[attribute] = null;
      }
    });
    return vault;
  };

  const possibleData = await getFromCache();
  return possibleData || createInitialData();
};

const useUserVault = (userId: string, user?: User) => {
  const queryClient = useQueryClient();

  const update = (newData: Vault) => {
    const prevData = queryClient.getQueryData<Vault>(['user', userId, 'vault']);
    queryClient.setQueryData(['user', userId, 'vault'], {
      id: {
        ...prevData?.id,
        ...newData.id,
      },
      idDoc: {
        ...prevData?.idDoc,
        ...newData.idDoc,
      },
      investorProfile: {
        ...prevData?.investorProfile,
        ...newData.investorProfile,
      },
      document: {
        ...prevData?.document,
        ...newData.document,
      },
    });
  };

  const userVaultQuery = useQuery<Vault>(
    ['user', userId, 'vault'],
    () => getVaultOrCreate(queryClient, user as User),
    { enabled: !!user },
  );

  return { ...userVaultQuery, update };
};

export default useUserVault;
