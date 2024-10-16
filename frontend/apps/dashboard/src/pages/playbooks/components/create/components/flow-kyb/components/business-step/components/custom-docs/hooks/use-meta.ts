import { useFormContext, useWatch } from 'react-hook-form';
import type { BusinessFormData } from '../../../business-step.types';

const useMeta = () => {
  const { control } = useFormContext<BusinessFormData>();
  const { custom } = useWatch({ control, name: 'docs' });
  const hasDoc = custom.length > 0 && !!custom[0].name && !!custom[0].identifier;

  return {
    custom,
    hasDoc,
  };
};

export default useMeta;
