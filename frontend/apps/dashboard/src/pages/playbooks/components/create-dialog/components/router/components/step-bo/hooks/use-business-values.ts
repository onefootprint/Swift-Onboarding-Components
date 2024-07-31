import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { useFormContext } from 'react-hook-form';

const useBusinessValues = () => {
  const { watch } = useFormContext<DataToCollectFormData>();
  const business = watch('business.basic');
  const name = business.name;
  const address = business.address;
  const type = business.type;
  const phoneNumber = business.phoneNumber;
  const tin = business.tin;
  const website = business.website;

  return {
    name,
    address,
    type,
    phoneNumber,
    tin,
    website,
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

export default useBusinessValues;
