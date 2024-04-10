import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import allAttributes from '../../../../utils/all-attributes/all-attributes';
import type { KycData } from '../../../../utils/data-types';
import updateDataValue from '../../../../utils/update-data-value';
import type { FormData } from '../../types';

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const requiresSsn9 = allAttributes(requirement).includes(
    CollectedKycDataOption.ssn9,
  );

  return (formData: FormData, isSkipped?: boolean) => {
    const convertedData: KycData = {};
    const { ssn4, ssn9 } = formData;
    if (isSkipped) {
      convertedData[IdDI.ssn9] = updateDataValue('', data[IdDI.ssn9]);
      convertedData[IdDI.ssn4] = updateDataValue('', data[IdDI.ssn4]);
    }
    // Only one of ssn4 vs ssn9 will be present
    else if (requiresSsn9 && ssn9) {
      convertedData[IdDI.ssn9] = updateDataValue(ssn9, data[IdDI.ssn9]);
    } else if (ssn4) {
      convertedData[IdDI.ssn4] = updateDataValue(ssn4, data[IdDI.ssn4]);
    }

    return convertedData;
  };
};

export default useConvertFormData;
