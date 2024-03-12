import { IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import type { KycData } from '../../../../utils/data-types';
import type { FormData } from '../../types';

const useConvertFormData = () => {
  const [machineState] = useCollectKycDataMachine();
  const { data } = machineState.context;

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { addressLine1, addressLine2, city, state, zip, country } = formData;

    const isAddressLine1Changed =
      addressLine1 !== data[IdDI.addressLine1]?.value;
    convertedData[IdDI.addressLine1] = {
      value: addressLine1,
      dirty: isAddressLine1Changed,
      bootstrap: isAddressLine1Changed
        ? false
        : data[IdDI.addressLine1]?.bootstrap,
      disabled: data[IdDI.addressLine1]?.disabled ?? false,
      decrypted: isAddressLine1Changed
        ? false
        : data[IdDI.addressLine1]?.decrypted,
    };

    const bothEmpty = !addressLine2 === !data[IdDI.addressLine2]?.value;
    const isAddressLine2Changed =
      !bothEmpty && addressLine2 !== data[IdDI.addressLine2]?.value;
    convertedData[IdDI.addressLine2] = {
      value: addressLine2,
      dirty: isAddressLine2Changed,
      bootstrap: isAddressLine2Changed
        ? false
        : data[IdDI.addressLine2]?.bootstrap,
      disabled: data[IdDI.addressLine2]?.disabled ?? false,
      decrypted: isAddressLine2Changed
        ? false
        : data[IdDI.addressLine2]?.decrypted,
    };

    const isCityChanged = city !== data[IdDI.city]?.value;
    convertedData[IdDI.city] = {
      value: city,
      dirty: isCityChanged,
      bootstrap: isCityChanged ? false : data[IdDI.city]?.bootstrap,
      disabled: data[IdDI.city]?.disabled ?? false,
      decrypted: isCityChanged ? false : data[IdDI.city]?.decrypted,
    };

    const newValue = typeof state === 'object' ? state.value : state;
    const isStateChanged = newValue !== data[IdDI.state]?.value;
    convertedData[IdDI.state] = {
      value: newValue,
      dirty: isStateChanged,
      bootstrap: isStateChanged ? false : data[IdDI.state]?.bootstrap,
      disabled: data[IdDI.state]?.disabled ?? false,
      decrypted: isStateChanged ? false : data[IdDI.state]?.decrypted,
    };

    const isZipChanged = zip !== data[IdDI.zip]?.value;
    convertedData[IdDI.zip] = {
      value: zip,
      dirty: isZipChanged,
      bootstrap: isZipChanged ? false : data[IdDI.zip]?.bootstrap,
      disabled: data[IdDI.zip]?.disabled ?? false,
      decrypted: isZipChanged ? false : data[IdDI.zip]?.decrypted,
    };

    const isCountryChanged = country.value !== data[IdDI.country]?.value;
    convertedData[IdDI.country] = {
      value: country.value,
      dirty: isCountryChanged,
      bootstrap: isCountryChanged ? false : data[IdDI.country]?.bootstrap,
      disabled: data[IdDI.country]?.disabled ?? false,
      decrypted: isCountryChanged ? false : data[IdDI.country]?.decrypted,
    };

    return convertedData;
  };
};

export default useConvertFormData;
