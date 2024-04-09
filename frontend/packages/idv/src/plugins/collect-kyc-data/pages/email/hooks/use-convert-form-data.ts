import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../hooks/use-collect-kyc-data-machine';
import allAttributes from '../../../utils/all-attributes';
import type { KycData } from '../../../utils/data-types';
import type { FormData } from '../types';

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const requiresEmail = allAttributes(requirement).includes(
    CollectedKycDataOption.email,
  );

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { email } = formData;
    if (!requiresEmail || !email) {
      return convertedData;
    }
    const oldEmail = data[IdDI.email];
    const isChanged = email !== oldEmail?.value;
    convertedData[IdDI.email] = {
      value: email,
      dirty: isChanged || oldEmail?.dirty,
      bootstrap: isChanged ? false : oldEmail?.bootstrap,
      disabled: oldEmail?.disabled ?? false,
      decrypted: isChanged ? false : oldEmail?.decrypted,
    };
    return convertedData;
  };
};

export default useConvertFormData;
