import { useFormContext } from 'react-hook-form';

import { PersonalInformationAndDocs } from '@/playbooks/utils/machine/types';

const useFormValues = () => {
  const { watch } = useFormContext();
  const personalInfoAndDocs: PersonalInformationAndDocs = watch(
    'personalInformationAndDocs',
  );

  const formValues = Object.keys(personalInfoAndDocs).filter(field => {
    if (!personalInfoAndDocs.ssn && field === 'ssnKind') {
      return false;
    }
    if (
      personalInfoAndDocs.ssn &&
      personalInfoAndDocs?.ssnKind &&
      field === 'ssn'
    ) {
      return false;
    }
    if (field === 'ssnOptional') {
      return false;
    }
    if (!personalInfoAndDocs.idDoc && field === 'idDocKind') {
      return false;
    }
    if (
      personalInfoAndDocs.idDoc &&
      personalInfoAndDocs?.idDocKind &&
      field === 'idDoc'
    ) {
      return false;
    }
    return true;
  });

  return { formValues };
};

export default useFormValues;
