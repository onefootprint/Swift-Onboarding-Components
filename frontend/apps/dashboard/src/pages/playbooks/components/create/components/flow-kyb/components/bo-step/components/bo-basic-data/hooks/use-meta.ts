import { CollectedKycDataOption } from '@onefootprint/types';
import { useFormContext, useWatch } from 'react-hook-form';
import type { BoBasicFormData } from '../bo-basic.data.types';

const useMeta = () => {
  const { control } = useFormContext<BoBasicFormData>();
  const data = useWatch({ control, name: 'data' });

  return {
    collectsBo: !!data.collect,
    collectsSsn: !!data.ssn.collect,
    hasAddress: !!data.address,
    hasDob: !!data.dob,
    hasEmail: !!data.email,
    hasPhoneNumber: !!data.phoneNumber,
    hasSsnOptional: !!data.ssn.optional,
    hasUsLegalStatus: !!data.usLegalStatus,
    hasUsTaxIdAcceptable: !!data.usTaxIdAcceptable,
    isSsn4: data.ssn.kind === CollectedKycDataOption.ssn4,
    isSsn9: data.ssn.kind === CollectedKycDataOption.ssn9,
    showNoPhoneFlow: false,
  };
};

export default useMeta;
