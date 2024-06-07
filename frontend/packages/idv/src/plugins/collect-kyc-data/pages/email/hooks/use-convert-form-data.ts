import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../hooks/use-collect-kyc-data-machine';
import allAttributes from '../../../utils/all-attributes';
import type { KycData } from '../../../utils/data-types';
import updateDataValue from '../../../utils/update-data-value';
import type { FormData } from '../types';

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const requiresEmail = allAttributes(requirement).includes(CollectedKycDataOption.email);

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { email } = formData;
    if (!requiresEmail || !email) {
      return convertedData;
    }
    convertedData[IdDI.email] = updateDataValue(email, data[IdDI.email]);
    return convertedData;
  };
};

export default useConvertFormData;
