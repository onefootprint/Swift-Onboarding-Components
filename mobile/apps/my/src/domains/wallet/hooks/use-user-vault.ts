import { EntityVault, IdDI } from '@onefootprint/types';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';

const getVaultOrCreate = async (queryClient: QueryClient) => {
  const getFromCache = () =>
    queryClient.getQueryData<EntityVault>(['user', 'vault']);

  const createInitialData = () => {
    const vault: EntityVault = {
      [IdDI.firstName]: 'John',
      [IdDI.lastName]: 'Doe',
      [IdDI.dob]: null,
      [IdDI.addressLine1]: null,
      [IdDI.addressLine2]: null,
      [IdDI.zip]: null,
      [IdDI.city]: null,
      [IdDI.country]: null,
      [IdDI.ssn9]: null,
    };

    return vault;
  };

  const possibleData = await getFromCache();
  return possibleData || createInitialData();
};

const useUserVault = () => {
  const queryClient = useQueryClient();

  const update = (newData: EntityVault) => {
    const prevData = queryClient.getQueryData<EntityVault>(['user', 'vault']);
    queryClient.setQueryData(['user', 'vault'], {
      ...prevData,
      ...newData,
    });
  };

  const query = useQuery<EntityVault>(['user', 'vault'], () =>
    getVaultOrCreate(queryClient),
  );

  return { ...query, update };
};

export default useUserVault;
