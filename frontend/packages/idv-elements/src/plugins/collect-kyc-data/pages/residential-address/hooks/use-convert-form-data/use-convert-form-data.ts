import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { KycData } from '../../../../utils/data-types';
import { FormData } from '../../types';

const useConvertFormData = () => {
  const [machineState] = useCollectKycDataMachine();
  const {
    data,
    requirement: { missingAttributes },
  } = machineState.context;
  const hasFixedAddressLine1 = data?.[IdDI.addressLine1]?.fixed;
  const hasFixedAddressLine2 = data?.[IdDI.addressLine2]?.fixed;
  const hasFixedCity = data?.[IdDI.city]?.fixed;
  const hasFixedState = data?.[IdDI.state]?.fixed;
  const hasFixedZip = data?.[IdDI.zip]?.fixed;
  const hasFixedCountry = data?.[IdDI.country]?.fixed;
  const requiresFullAddress = missingAttributes.includes(
    CollectedKycDataOption.fullAddress,
  );

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { addressLine1, addressLine2, city, state, zip, country } = formData;

    if (zip && !hasFixedZip) {
      convertedData[IdDI.zip] = {
        value: zip,
      };
    }

    if (country && !hasFixedCountry) {
      convertedData[IdDI.country] = {
        value: country.value,
      };
    }

    if (requiresFullAddress) {
      if (addressLine1 && !hasFixedAddressLine1) {
        convertedData[IdDI.addressLine1] = {
          value: addressLine1,
        };
      }

      if (addressLine2 && !hasFixedAddressLine2) {
        convertedData[IdDI.addressLine2] = {
          value: addressLine2,
        };
      }

      if (city && !hasFixedCity) {
        convertedData[IdDI.city] = {
          value: city,
        };
      }

      if (state && !hasFixedState) {
        convertedData[IdDI.state] = {
          value: typeof state === 'object' ? state.value : state,
        };
      }
    }

    return convertedData;
  };
};

export default useConvertFormData;
