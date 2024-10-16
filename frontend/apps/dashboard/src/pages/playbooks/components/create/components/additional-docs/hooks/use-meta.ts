import { useFormContext } from 'react-hook-form';
import type { AdditionalDocsFormData } from '../additional-docs.types';

const useMeta = () => {
  const { watch } = useFormContext<AdditionalDocsFormData>();
  const poa = watch('docs.poa') || false;
  const possn = watch('docs.possn') || false;
  const custom = watch('docs.custom') || [];
  const requireManualReview = watch('docs.requireManualReview') || false;

  const hasPoA = !!poa;
  const hasPoSsn = !!possn;
  const hasCustom = custom.length > 0;
  const hasDoc = hasPoA || hasPoSsn || hasCustom;

  return {
    poa,
    possn,
    custom,
    requireManualReview,
    meta: {
      hasPoA,
      hasPoSsn,
      hasCustom,
      hasDoc,
    },
  };
};

export default useMeta;
