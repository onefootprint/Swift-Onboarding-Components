import useEntityVault from '../../../hooks/use-entity-vault';
import useEntity from './use-entity';
import useEntityId from './use-entity-id';

const useCurrentEntity = () => {
  const id = useEntityId();
  const entityQuery = useEntity(id);
  const entityVaultQuery = useEntityVault(id, entityQuery.data);

  const isLoadingVault = entityVaultQuery.isLoading && !entityQuery.isError;

  return {
    ...entityQuery,
    isLoading: entityQuery.isLoading || isLoadingVault,
  };
};

export default useCurrentEntity;
