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
  const hasFixedSsn4 = data?.[IdDI.ssn4]?.fixed;
  const hasFixedSsn9 = data?.[IdDI.ssn9]?.fixed;
  const requiresSsn9 = missingAttributes.includes(CollectedKycDataOption.ssn9);

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { ssn4, ssn9 } = formData;

    // Only one of ssn4 vs ssn9 will be present
    if (requiresSsn9) {
      if (ssn9 && !hasFixedSsn9) {
        convertedData[IdDI.ssn9] = {
          value: ssn9,
        };
      }
    } else if (ssn4 && !hasFixedSsn4) {
      convertedData[IdDI.ssn4] = {
        value: ssn4,
      };
    }

    return convertedData;
  };
};

export default useConvertFormData;
