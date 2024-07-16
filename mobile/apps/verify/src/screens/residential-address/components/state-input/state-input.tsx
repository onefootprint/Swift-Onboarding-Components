import { COUNTRIES_WITH_PROVINCES, COUNTRIES_WITH_STATES, type CountryRecord } from '@onefootprint/global-constants';
import type { SelectRef } from '@onefootprint/ui';
import { Select, TextInput } from '@onefootprint/ui';
import React from 'react';
import { type Control, Controller } from 'react-hook-form';
import type { TextInput as RNTextInput } from 'react-native';

import states from '@/constants/states';
import useTranslation from '@/hooks/use-translation';

import type { FormData } from '../../types';

type StateInputProps = {
  control: Control<FormData, unknown>;
  country: CountryRecord;
  stateRef: React.RefObject<SelectRef | RNTextInput>;
};

const StateInput = ({ control, country, stateRef }: StateInputProps) => {
  const { t } = useTranslation('pages.residential-address');
  const isCountryUs = country.value === 'US';
  const shouldCollectState =
    COUNTRIES_WITH_STATES.includes(country.value) || COUNTRIES_WITH_PROVINCES.includes(country.value);

  if (!shouldCollectState) {
    return null;
  }

  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        return isCountryUs ? (
          <Select
            hasError={!!error}
            hint={error?.message}
            label={t('form.state.label')}
            onBlur={onBlur}
            onChange={newValue => {
              onChange(newValue);
            }}
            options={states}
            ref={stateRef as React.RefObject<SelectRef>}
            value={typeof value === 'object' ? value : undefined}
            searchInputProps={{
              autoComplete: 'postal-address-locality',
              returnKeyType: 'next',
              placeholder: t('form.state.placeholder'),
              textContentType: 'addressState',
            }}
          />
        ) : (
          <TextInput
            blurOnSubmit={false}
            returnKeyType="next"
            hasError={!!error}
            hint={error?.message}
            inputMode="text"
            label={t('form.state.international-label')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('form.state.international-placeholder')}
            private
            ref={stateRef as React.RefObject<RNTextInput>}
            textContentType="addressState"
            value={typeof value === 'string' ? value : undefined}
          />
        );
      }}
      name="state"
    />
  );
};

export default StateInput;
