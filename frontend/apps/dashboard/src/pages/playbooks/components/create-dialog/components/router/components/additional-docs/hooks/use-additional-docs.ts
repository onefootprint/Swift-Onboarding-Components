import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { useFormContext } from 'react-hook-form';

const useAdditionalDocs = () => {
  const { watch } = useFormContext<DataToCollectFormData>();
  const poa = watch('personal.additionalDocs.poa') || false;
  const possn = watch('personal.additionalDocs.possn') || false;
  const custom = watch('personal.additionalDocs.custom') || [];
  const requireManualReview = watch('personal.additionalDocs.requireManualReview') || false;

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

export default useAdditionalDocs;
