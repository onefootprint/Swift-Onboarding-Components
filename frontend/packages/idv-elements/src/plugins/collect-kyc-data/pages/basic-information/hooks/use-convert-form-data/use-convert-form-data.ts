import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { KycData } from '../../../../utils/data-types';
import { FormData } from '../../types';

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const {
    data,
    requirement: { missingAttributes },
  } = state.context;
  const hasFixedName =
    data?.[IdDI.firstName]?.fixed && data?.[IdDI.lastName]?.fixed;
  const hasFixedDob = data?.[IdDI.dob]?.fixed;
  const requiresName = missingAttributes.includes(CollectedKycDataOption.name);
  const requiresDob = missingAttributes.includes(CollectedKycDataOption.dob);

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { firstName, lastName, dob } = formData;

    if (requiresName && firstName && !hasFixedName) {
      convertedData[IdDI.firstName] = {
        value: firstName,
      };
    }

    if (requiresName && lastName && !hasFixedName) {
      convertedData[IdDI.lastName] = {
        value: lastName,
      };
    }

    if (requiresDob && dob && !hasFixedDob) {
      convertedData[IdDI.dob] = {
        value: dob,
      };
    }

    return convertedData;
  };
};

export default useConvertFormData;
