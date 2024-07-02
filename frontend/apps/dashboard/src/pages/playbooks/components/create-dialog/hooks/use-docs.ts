import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { useFormContext } from 'react-hook-form';

const useDocs = () => {
  const { watch } = useFormContext<DataToCollectFormData>();
  const globalDocs = watch('personal.docs.global') || [];
  const countryDocs = watch('personal.docs.country') || {};
  const selfie = watch('personal.docs.selfie') || false;

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

export default useDocs;
