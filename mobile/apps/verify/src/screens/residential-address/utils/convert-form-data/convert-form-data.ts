import { IdDI } from '@onefootprint/types';

import type { KycData } from '@/types';

import type { FormData } from '../../types';

const convertFormData = ({
  data,
  formData,
}: {
  data: KycData;
  formData: FormData;
}) => {
  const isAddressLine1Disabled = data?.[IdDI.addressLine1]?.disabled;
  const isAddressLine2Disabled = data?.[IdDI.addressLine2]?.disabled;
  const isCityDisabled = data?.[IdDI.city]?.disabled;
  const isStateDisabled = data?.[IdDI.state]?.disabled;
  const isZipDisabled = data?.[IdDI.zip]?.disabled;
  const isCountryDisabled = data?.[IdDI.country]?.disabled;

  const convertedData: KycData = {};
  const { addressLine1, addressLine2, city, state, zip, country } = formData;

  if (!isAddressLine1Disabled) {
    convertedData[IdDI.addressLine1] = {
      value: addressLine1,
    };
  }

  if (!isAddressLine2Disabled) {
    convertedData[IdDI.addressLine2] = {
      value: addressLine2,
    };
  }

  if (!isCityDisabled) {
    convertedData[IdDI.city] = {
      value: city,
    };
  }

  if (!isStateDisabled) {
    convertedData[IdDI.state] = {
      value: typeof state === 'object' ? state.value : state,
    };
  }

  if (!isZipDisabled) {
    convertedData[IdDI.zip] = {
      value: zip,
    };
  }

  if (!isCountryDisabled) {
    convertedData[IdDI.country] = {
      value: country.value,
    };
  }

  return convertedData;
};

export default convertFormData;
