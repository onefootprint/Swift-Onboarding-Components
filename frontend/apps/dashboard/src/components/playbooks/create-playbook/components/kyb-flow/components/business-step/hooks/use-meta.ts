import { useFormContext, useWatch } from 'react-hook-form';
import type { BusinessFormData } from '../business-step.types';

const useMeta = () => {
  const { control } = useFormContext<BusinessFormData>();
  const business = useWatch({
    control,
    name: 'data',
  });
  const { name, address, type, phoneNumber, tin, website } = business;

  return {
    data: {
      name,
      address,
      type,
      phoneNumber,
      tin,
      website,
    },
    meta: {
      hasName: !!name,
      hasAddress: !!address,
      hasType: !!type,
      hasPhoneNumber: !!phoneNumber,
      hasTin: !!tin,
      hasWebsite: !!website,
    },
  };
};

export default useMeta;
