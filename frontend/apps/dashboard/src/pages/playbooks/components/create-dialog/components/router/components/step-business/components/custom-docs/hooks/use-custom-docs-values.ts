import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { useFormContext } from 'react-hook-form';

const useCustomDocsValues = () => {
  const { watch } = useFormContext<DataToCollectFormData>();
  const custom = watch('business.docs.custom') || [];
  const hasCustom = custom.length > 0 && !!custom[0].name && !!custom[0].identifier;
  const hasDoc = hasCustom;

  return {
    custom,
    meta: {
      hasDoc,
    },
  };
};

export default useCustomDocsValues;
