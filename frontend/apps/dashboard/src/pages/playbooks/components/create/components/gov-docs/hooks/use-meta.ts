import { useFormContext } from 'react-hook-form';
import type { GovDocsFormData } from '../gov-docs.types';

const useMeta = () => {
  const { watch } = useFormContext<GovDocsFormData>();
  const globalDocs = watch('gov.global') || [];
  const countryDocs = watch('gov.country') || {};
  const selfie = watch('gov.selfie') || false;

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

export default useMeta;
