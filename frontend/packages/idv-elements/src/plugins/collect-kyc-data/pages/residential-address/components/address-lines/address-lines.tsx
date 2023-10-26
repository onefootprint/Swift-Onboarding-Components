import { STATES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { AddressInput, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { FormData } from '../../types';
import getAddressComponent from '../../utils/get-address-components';

const AddressLines = () => {
  const {
    register,
    formState: { errors },
    setValue,
    resetField,
    watch,
  } = useFormContext<FormData>();
  const country = watch('country');
  const { t } = useTranslation('pages.residential-address.form');
  const isDomestic = country.value === 'US';

  const handleAddressSelect = async (
    prediction?: google.maps.places.AutocompletePrediction | null,
  ) => {
    if (!prediction) {
      return;
    }

    resetField('addressLine1');
    resetField('addressLine2');
    resetField('city');
    resetField('state');
    resetField('zip');

    const formattedStreetAddress = prediction?.structured_formatting.main_text;
    if (formattedStreetAddress) {
      setValue('addressLine1', formattedStreetAddress);
    }

    const result = await getAddressComponent(prediction);
    if (result) {
      if (result.addressLine1) {
        setValue('addressLine1', result.addressLine1);
      }
      if (result.addressLine2) {
        setValue('addressLine2', result.addressLine2);
      }
      if (result.city) {
        setValue('city', result.city);
      }
      if (result.state) {
        if (isDomestic) {
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
  };

  return (
    <>
      <AddressInput
        autoFocus
        data-private
        country={country.value}
        hasError={!!errors.addressLine1}
        hint={errors.addressLine1 && t('address-line-1.error')}
        label={
          isDomestic
            ? t('address-line-1.label')
            : t('address-line-1.international-label')
        }
        onSelect={handleAddressSelect}
        placeholder={t('address-line-1.placeholder')}
        {...register('addressLine1', {
          required: true,
          pattern: /^(?!p\.?o\.?\s*?(?:box)?\s*?[0-9]+?).*$/i,
        })}
      />
      <TextInput
        data-private
        autoComplete="address-line2"
        label={
          isDomestic
            ? t('address-line-2.label')
            : t('address-line-2.international-label')
        }
        placeholder={
          isDomestic
            ? t('address-line-2.placeholder')
            : t('address-line-2.international-placeholder')
        }
        {...register('addressLine2')}
      />
    </>
  );
};

export default AddressLines;
