import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import allAttributes from '../../../../utils/all-attributes/all-attributes';
import type { KycData } from '../../../../utils/data-types';
import type { FormData } from '../../types';

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const isSsn4Disabled = data?.[IdDI.ssn4]?.disabled;
  const isSsn9Disabled = data?.[IdDI.ssn9]?.disabled;
  const requiresSsn9 = allAttributes(requirement).includes(
    CollectedKycDataOption.ssn9,
  );

  return (formData: FormData, isSkipped?: boolean) => {
    const convertedData: KycData = {};
    const { ssn4, ssn9 } = formData;

    // Only one of ssn4 vs ssn9 will be present
    if (requiresSsn9) {
      if (ssn9 && !isSsn9Disabled) {
        convertedData[IdDI.ssn9] = {
          value: isSkipped ? '' : ssn9,
        };
      }
    } else if (ssn4 && !isSsn4Disabled) {
      convertedData[IdDI.ssn4] = {
        value: isSkipped ? '' : ssn4,
      };
    }

    return convertedData;
  };
};

export default useConvertFormData;
