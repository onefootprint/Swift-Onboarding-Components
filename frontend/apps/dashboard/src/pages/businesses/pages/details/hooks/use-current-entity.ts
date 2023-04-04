import { useRouter } from 'next/router';

import useEntityVault from '../../../hooks/use-entity-vault';
import useEntity from './use-entity';

const useCurrentEntity = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const entityQuery = useEntity(id);
  const entityVaultQuery = useEntityVault(id, entityQuery.data);

  const isLoadingVault = entityVaultQuery.isLoading && !entityQuery.isError;

  return {
    ...entityQuery,
    isLoading: entityQuery.isLoading || isLoadingVault,
  };
};

export default useCurrentEntity;
