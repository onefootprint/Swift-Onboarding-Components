import type { DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { useFormContext, useWatch } from 'react-hook-form';

const useFormValues = () => {
  const { getValues } = useFormContext<DataToCollectFormData>();

  return {
    ...useWatch(),
    ...getValues(),
  };
};

export default useFormValues;
