import { IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { KycData } from '../../../../utils/data-types';
import { FormData } from '../../types';

const useConvertFormData = () => {
  const [machineState] = useCollectKycDataMachine();
  const { data } = machineState.context;
  const isAddressLine1Disabled = data?.[IdDI.addressLine1]?.disabled;
  const isAddressLine2Disabled = data?.[IdDI.addressLine2]?.disabled;
  const isCityDisabled = data?.[IdDI.city]?.disabled;
  const isStateDisabled = data?.[IdDI.state]?.disabled;
  const isZipDisabled = data?.[IdDI.zip]?.disabled;
  const isCountryDisabled = data?.[IdDI.country]?.disabled;

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { addressLine1, addressLine2, city, state, zip, country } = formData;

    if (addressLine1 && !isAddressLine1Disabled) {
      convertedData[IdDI.addressLine1] = {
        value: addressLine1,
      };
    }

    if (addressLine2 && !isAddressLine2Disabled) {
      convertedData[IdDI.addressLine2] = {
        value: addressLine2,
      };
    }

    if (city && !isCityDisabled) {
      convertedData[IdDI.city] = {
        value: city,
      };
    }

    if (state && !isStateDisabled) {
      convertedData[IdDI.state] = {
        value: typeof state === 'object' ? state.value : state,
      };
    }

    if (zip && !isZipDisabled) {
      convertedData[IdDI.zip] = {
        value: zip,
      };
    }

    if (country && !isCountryDisabled) {
      convertedData[IdDI.country] = {
        value: country.value,
      };
    }

    return convertedData;
  };
};

export default useConvertFormData;
