import { COUNTRIES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { CountrySelect } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useL10nContext } from '../../../../../../components/l10n-provider';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import type { FormData } from '../../types';

type CountryFieldProps = {
  disabled?: boolean;
  onChange: () => void;
};

const CountryField = ({ onChange, disabled }: CountryFieldProps) => {
  const [state] = useCollectKycDataMachine();
  const {
    context: { config },
  } = state;
  const { control, watch } = useFormContext<FormData>();
  const country = watch('country');
  const { t } = useTranslation('kyc.pages.residential-address.form.country');
  const l10n = useL10nContext();
  const allowedCountries = new Set(config.supportedCountries);
  const shouldDisable = disabled || allowedCountries.size === 1;
  const options = COUNTRIES.filter(entry => allowedCountries.has(entry.value));

  return (
    <Controller
      data-private
      control={control}
      name="country"
      render={({ field }) => (
        <CountrySelect
          hint={
            shouldDisable && country
              ? t('disabled-hint', { countryName: country.label })
              : undefined
          }
          options={options}
          label={t('label')}
          disabled={shouldDisable}
          onBlur={field.onBlur}
          onChange={nextValue => {
            field.onChange(nextValue);
            onChange();
          }}
          placeholder={t('placeholder')}
          value={field.value}
          locale={l10n?.locale}
        />
      )}
    />
  );
};

export default CountryField;
