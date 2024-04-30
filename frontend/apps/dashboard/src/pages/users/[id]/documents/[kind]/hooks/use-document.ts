import { getErrorMessage } from '@onefootprint/request';
import type {
  DataIdentifier,
  Entity,
  EntityVault,
  VaultValue,
} from '@onefootprint/types';
import { useRouter } from 'next/router';

import useEntityVaultWithTransforms from '@/entities/hooks/use-entity-vault-with-transforms';

const useDocuments = (entity: Entity) => {
  const router = useRouter();
  const { kind } = router.query;
  const { isReady } = router;
  const { data, isLoading, error } = useEntityVaultWithTransforms(
    entity.id,
    entity,
  );
  const documents = getDocuments(data?.vault, kind);
  const hasKind =
    typeof kind === 'string' &&
    data?.dataKinds &&
    Object.keys(data.dataKinds || {}).some(key => key.startsWith(kind));

  return {
    data: documents,
    meta: {
      notFound: (isReady && data && !hasKind) || false,
      isEncrypted: Object.values(documents || {}).every(doc => doc === null),
    },
    isLoading,
    error,
    errorMessage: error ? getErrorMessage(error) : null,
  };
};

const getDocuments = (entityVault?: EntityVault, kind?: string | string[]) => {
  if (!kind || typeof kind !== 'string' || !entityVault) {
    return null;
  }
  return Object.keys(entityVault).reduce(
    (acc, key) => {
      const keyCasted = key as DataIdentifier;
      if (key.startsWith(kind)) {
        acc[keyCasted] = entityVault[keyCasted];
      }
      return acc;
    },
    {} as Record<DataIdentifier, VaultValue>,
  );
};

export default useDocuments;
