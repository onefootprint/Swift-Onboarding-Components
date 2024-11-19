import { useFormContext, useWatch } from 'react-hook-form';
import type { PersonFormData } from '../person.types';

const useMeta = () => {
  const { control } = useFormContext<PersonFormData>();
  const person = useWatch({ control, name: 'person' });

  return {
    collectsSsn: !!person.ssn.collect,
    hasAddress: !!person.address,
    hasDob: !!person.dob,
    hasEmail: !!person.email,
    hasPhoneNumber: !!person.phoneNumber,
    hasSsnOptional: !!person.ssn.optional,
    hasUsLegalStatus: !!person.usLegalStatus,
    hasUsTaxIdAcceptable: !!person.usTaxIdAcceptable,
    isSsn4: person.ssn.kind === 'ssn4',
    isSsn9: person.ssn.kind === 'ssn9',
    showNoPhoneFlow: false,
  };
};

export default useMeta;
