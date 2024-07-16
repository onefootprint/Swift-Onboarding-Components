import { COUNTRIES } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import { CountrySelect } from '@onefootprint/ui';
import React from 'react';
import { type Control, Controller } from 'react-hook-form';

import useTranslation from '@/hooks/use-translation';

import type { FormData } from '../../types';

type CountryInputProps = {
  control: Control<FormData, unknown>;
  supportedCountries?: CountryCode[];
  onCountryChange: () => void;
};

const CountryInput = ({ control, supportedCountries, onCountryChange }: CountryInputProps) => {
  const { t } = useTranslation('pages.residential-address');
  const allowedCountries = new Set(supportedCountries);
  const shouldDisableCountry = allowedCountries.size === 1;
  const countryOptions = COUNTRIES.filter(entry => allowedCountries.has(entry.value));
  // TODO: We need to update l10n using locale on country change

  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        return (
          <CountrySelect
            hasError={!!error}
            hint={
              shouldDisableCountry && value
                ? t('form.country.disabled-hint', {
                    countryName: value.label,
                  })
                : error?.message
            }
            label={t('form.country.label')}
            onBlur={onBlur}
            value={value}
            options={countryOptions}
            onChange={newValue => {
              onChange(newValue);
              onCountryChange();
            }}
            searchInputProps={{
              placeholder: t('form.country.placeholder'),
              returnKeyType: 'next',
              autoComplete: 'country',
              textContentType: 'countryName',
            }}
            disabled={shouldDisableCountry}
          />
        );
      }}
      name="country"
    />
  );
};

export default CountryInput;
