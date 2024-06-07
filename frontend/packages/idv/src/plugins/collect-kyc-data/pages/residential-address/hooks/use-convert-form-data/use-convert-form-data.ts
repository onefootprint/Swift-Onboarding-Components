import { IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import type { KycData } from '../../../../utils/data-types';
import updateDataValue from '../../../../utils/update-data-value';
import type { FormData } from '../../types';

const useConvertFormData = () => {
  const [machineState] = useCollectKycDataMachine();
  const { data } = machineState.context;

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { addressLine1, addressLine2, city, state, zip, country } = formData;

    convertedData[IdDI.addressLine1] = updateDataValue(addressLine1, data[IdDI.addressLine1]);
    convertedData[IdDI.addressLine2] = updateDataValue(addressLine2, data[IdDI.addressLine2]);
    convertedData[IdDI.city] = updateDataValue(city, data[IdDI.city]);
    const newStateValue = typeof state === 'object' ? state.value : state;
    convertedData[IdDI.state] = updateDataValue(newStateValue, data[IdDI.state]);
    convertedData[IdDI.zip] = updateDataValue(zip, data[IdDI.zip]);
    convertedData[IdDI.country] = updateDataValue(country.value, data[IdDI.country]);
    return convertedData;
  };
};

export default useConvertFormData;
