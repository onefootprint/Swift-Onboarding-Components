import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import allAttributes from '../../../../utils/all-attributes/all-attributes';
import type { KycData } from '../../../../utils/data-types';
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

    // Only one of ssn4 vs ssn9 will be present
    if (requiresSsn9 && ssn9) {
      const isChanged = ssn9 !== data[IdDI.ssn9]?.value;
      convertedData[IdDI.ssn9] = {
        value: isSkipped ? '' : ssn9,
        dirty: isSkipped ? false : isChanged,
        bootstrap: isChanged ? false : data[IdDI.ssn9]?.bootstrap,
        disabled: data[IdDI.ssn9]?.disabled ?? false,
        decrypted: isChanged ? false : data[IdDI.ssn9]?.decrypted,
      };
    } else if (ssn4) {
      const isChanged = ssn4 !== data[IdDI.ssn4]?.value;
      convertedData[IdDI.ssn4] = {
        value: isSkipped ? '' : ssn4,
        dirty: isSkipped ? false : isChanged,
        bootstrap: isChanged ? false : data[IdDI.ssn4]?.bootstrap,
        disabled: data[IdDI.ssn4]?.disabled ?? false,
        decrypted: isChanged ? false : data[IdDI.ssn4]?.decrypted,
      };
    }

    return convertedData;
  };
};

export default useConvertFormData;
