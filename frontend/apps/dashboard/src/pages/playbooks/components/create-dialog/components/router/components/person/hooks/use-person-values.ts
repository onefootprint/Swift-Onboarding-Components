import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { CollectedKycDataOption } from '@onefootprint/types';
import { useFormContext } from 'react-hook-form';
import useSession from 'src/hooks/use-session';

const usePersonValues = () => {
  const { watch } = useFormContext<DataToCollectFormData>();
  const { basic, investorProfile } = watch('person');
  const business = watch('business');
  const {
    data: { user, org },
  } = useSession();

  return {
    basic,
    investorProfile,
    meta: {
      collectsBOInfo: business?.basic.collectBOInfo,
      collectsSsn: !!basic.ssn.collect,
      hasAddress: !!basic.address,
      hasDob: !!basic.dob,
      hasEmail: !!basic.email,
      hasPhoneNumber: !!basic.phoneNumber,
      hasSsnOptional: !!basic.ssn.optional,
      hasUsLegalStatus: !!basic.usLegalStatus,
      hasUsTaxIdAcceptable: !!basic.usTaxIdAcceptable,
      isSsn4: basic.ssn.kind === CollectedKycDataOption.ssn4,
      isSsn9: basic.ssn.kind === CollectedKycDataOption.ssn9,
      showNoPhoneFlow: user?.isFirmEmployee || org?.name.toLowerCase().includes('findigs'),
    },
  };
};

export default usePersonValues;
