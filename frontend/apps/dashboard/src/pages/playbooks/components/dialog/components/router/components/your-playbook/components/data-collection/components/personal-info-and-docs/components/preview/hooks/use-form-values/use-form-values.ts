import { useFormContext } from 'react-hook-form';

import { PersonalInformationAndDocs } from '../../../../../../../../your-playbook.types';

const useFormValues = () => {
  const { getValues } = useFormContext();
  const personalInfoAndDocs: PersonalInformationAndDocs = getValues(
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
    if (
      !personalInfoAndDocs.idDoc &&
      (field === 'idDocKind' || field === 'selfie')
    ) {
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
