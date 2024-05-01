import { getErrorMessage } from '@onefootprint/request';
import { useRouter } from 'next/router';

import useCurrentEntityDocuments from '@/entity/hooks/use-current-entity-documents';

const useDocuments = () => {
  const router = useRouter();
  const entityQuery = useCurrentEntityDocuments();

  const getMeta = () => {
    const { kind } = router.query;
    const hasKind = entityQuery.data?.some(doc => doc.kind === kind);
    const isReady = router.isReady && entityQuery.isFetched;

    return {
      notFound: isReady ? !hasKind : false,
      kind,
      isEncrypted: true,
    };
  };

  return {
    ...entityQuery,
    errorMessage: entityQuery.error ? getErrorMessage(entityQuery.error) : null,
    meta: getMeta(),
  };
};

export default useDocuments;
