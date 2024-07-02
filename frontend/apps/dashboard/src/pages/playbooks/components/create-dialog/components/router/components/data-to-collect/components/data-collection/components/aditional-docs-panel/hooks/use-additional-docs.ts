import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { useFormContext } from 'react-hook-form';

const useAdditionalDocs = () => {
  const { watch } = useFormContext<DataToCollectFormData>();
  const poa = watch('personal.additionalDocs.poa') || false;
  const possn = watch('personal.additionalDocs.possn') || false;

  const hasPoA = !!poa;
  const hasPoSsn = !!possn;
  const hasDoc = hasPoA || hasPoSsn;

  return {
    poa,
    possn,
    meta: {
      hasPoA,
      hasPoSsn,
      hasDoc,
    },
  };
};

export default useAdditionalDocs;
