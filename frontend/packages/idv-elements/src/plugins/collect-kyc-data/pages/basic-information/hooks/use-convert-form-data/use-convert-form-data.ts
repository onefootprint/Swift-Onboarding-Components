import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { KycData } from '../../../../utils/data-types';
import { FormData } from '../../types';

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const {
    data,
    requirement: { missingAttributes, populatedAttributes },
  } = state.context;
  const isFirstNameDisabled = data?.[IdDI.firstName]?.disabled;
  const isLastNameDisabled = data?.[IdDI.lastName]?.disabled;
  const isDobDisabled = data?.[IdDI.dob]?.disabled;
  const allAttributes = missingAttributes.concat(populatedAttributes);
  const requiresName = allAttributes.includes(CollectedKycDataOption.name);
  const requiresDob = allAttributes.includes(CollectedKycDataOption.dob);

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { firstName, lastName, dob } = formData;

    if (requiresName && firstName && !isFirstNameDisabled) {
      convertedData[IdDI.firstName] = {
        value: firstName,
      };
    }

    if (requiresName && lastName && !isLastNameDisabled) {
      convertedData[IdDI.lastName] = {
        value: lastName,
      };
    }

    if (requiresDob && dob && !isDobDisabled) {
      convertedData[IdDI.dob] = {
        value: dob,
      };
    }

    return convertedData;
  };
};

export default useConvertFormData;
