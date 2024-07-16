import type { CountryRecord } from '@onefootprint/global-constants';
import type { AddressPrediction } from '@onefootprint/ui';
import { AddressInput, TextInput } from '@onefootprint/ui';
import React from 'react';
import { type Control, Controller } from 'react-hook-form';
import type { TextInput as RNTextInput } from 'react-native';

import useTranslation from '@/hooks/use-translation';

import type { FormData } from '../../types';

type AddressInputProps = {
  control: Control<FormData, unknown>;
  country: CountryRecord;
  onAddressSelect: (prediction?: AddressPrediction | null) => Promise<void>;
  addressLine2Ref: React.RefObject<RNTextInput>;
};

const AddressLinesInput = ({ control, country, onAddressSelect, addressLine2Ref }: AddressInputProps) => {
  const { t } = useTranslation('pages.residential-address');
  const isCountryUs = country.value === 'US';

  return (
    <>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
          return (
            <AddressInput
              country={country.value}
              hasError={!!error}
              hint={error?.message}
              label={isCountryUs ? t('form.address-line1.label') : t('form.address-line1.international-label')}
              onBlur={onBlur}
              onChange={onAddressSelect}
              onChangeText={onChange}
              placeholder={t('form.address-line1.placeholder')}
              searchInputProps={{
                autoComplete: 'address-line1',
                returnKeyType: 'next',
                placeholder: t('form.address-line1.placeholder'),
                textContentType: 'streetAddressLine1',
                blurOnSubmit: false,
                onSubmitEditing: () => {
                  addressLine2Ref.current?.focus();
                },
              }}
              value={value}
            />
          );
        }}
        name="addressLine1"
      />
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
          return (
            <TextInput
              autoComplete="address-line2"
              blurOnSubmit={false}
              returnKeyType="next"
              hasError={!!error}
              hint={error?.message}
              inputMode="text"
              label={isCountryUs ? t('form.address-line2.label') : t('form.address-line2.international-label')}
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={() => addressLine2Ref.current?.focus()}
              placeholder={
                isCountryUs ? t('form.address-line2.placeholder') : t('form.address-line2.international-placeholder')
              }
              private
              ref={addressLine2Ref}
              textContentType="streetAddressLine2"
              value={value}
            />
          );
        }}
        name="addressLine2"
      />
    </>
  );
};

export default AddressLinesInput;
