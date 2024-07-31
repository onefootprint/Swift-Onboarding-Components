import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { useFormContext } from 'react-hook-form';

const useAdditionalDocs = () => {
  const { watch } = useFormContext<DataToCollectFormData>();
  const poa = watch('person.docs.additional.poa') || false;
  const possn = watch('person.docs.additional.possn') || false;
  const custom = watch('person.docs.additional.custom') || [];
  const requireManualReview = watch('person.docs.additional.requireManualReview') || false;

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
