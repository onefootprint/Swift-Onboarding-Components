import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { useFormContext } from 'react-hook-form';

const useGovDocs = () => {
  const { watch } = useFormContext<DataToCollectFormData>();
  const globalDocs = watch('person.docs.gov.global') || [];
  const countryDocs = watch('person.docs.gov.country') || {};
  const selfie = watch('person.docs.gov.selfie') || false;

  const hasGlobalDocs = globalDocs.length > 0;
  const hasCountryDocs = Object.keys(countryDocs).length > 0;
  const hasSelfie = !!selfie;
  const hasDoc = hasGlobalDocs || hasCountryDocs;

  return {
    globalDocs,
    countryDocs,
    selfie,
    meta: {
      hasGlobalDocs,
      hasCountryDocs,
      hasSelfie,
      hasDoc,
    },
  };
};

export default useGovDocs;
