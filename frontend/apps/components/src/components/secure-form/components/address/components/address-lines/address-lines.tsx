import { STATES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { CountryCode } from '@onefootprint/types';
import { AddressInput, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import getAddressComponent from './utils/get-address-components';

type AddressLinesProps = {
  countryCode: CountryCode;
  disabled?: boolean;
};

const AddressLines = ({ countryCode, disabled }: AddressLinesProps) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const { t } = useTranslation('components.secure-form.address.form');

  const handleAddressSelect = async (
    prediction?: google.maps.places.AutocompletePrediction | null,
  ) => {
    if (prediction) {
      const formattedStreetAddress =
        prediction?.structured_formatting.main_text;
      if (formattedStreetAddress) {
        setValue('addressLine1', formattedStreetAddress);
      }

      const result = await getAddressComponent(prediction);
      if (result) {
        if (result.city) {
          setValue('city', result.city);
        }
        if (result.state) {
          if (countryCode === 'US') {
            const possibleState = STATES.find(
              stateOption => stateOption.label === result.state,
            );
            if (possibleState) {
              setValue('state', possibleState);
            }
          } else {
            setValue('state', result.state);
          }
        }
        if (result.zip) {
          setValue('zip', result.zip);
        }
      }
    }
  };

  return (
    <>
      <AddressInput
        data-private
        disabled={disabled}
        country={countryCode}
        hasError={!!errors.addressLine1}
        hint={errors.addressLine1 && t('address-line-1.error')}
        label={t('address-line-1.label')}
        onSelect={handleAddressSelect}
        placeholder={t('address-line-1.placeholder')}
        {...register('addressLine1', {
          required: true,
          pattern: /^(?!p\.?o\.?\s?box).*$/i,
        })}
      />
      <TextInput
        data-private
        disabled={disabled}
        autoComplete="address-line2"
        label={t('address-line-2.label')}
        placeholder={t('address-line-2.placeholder')}
        {...register('addressLine2')}
      />
    </>
  );
};

export default AddressLines;
