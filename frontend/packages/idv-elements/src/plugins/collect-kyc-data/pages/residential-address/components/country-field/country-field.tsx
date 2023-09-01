import { COUNTRIES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { CountrySelect } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { FormData } from '../../types';

type CountryFieldProps = {
  onChange: () => void;
};

const CountryField = ({ onChange }: CountryFieldProps) => {
  const [state] = useCollectKycDataMachine();
  const {
    context: { config },
  } = state;
  const { control } = useFormContext<FormData>();
  const { t } = useTranslation('pages.residential-address.form.country');
  const allowedCountries = new Set(config.supportedCountries);
  const disabled =
    !config.allowInternationalResidents || allowedCountries.size < 2;
  const options = COUNTRIES.filter(entry => allowedCountries.has(entry.value));

  return (
    <Controller
      data-private
      control={control}
      name="country"
      render={({ field }) => (
        <CountrySelect
          options={options}
          label={t('label')}
          disabled={disabled}
          onBlur={field.onBlur}
          onChange={nextValue => {
            field.onChange(nextValue);
            onChange();
          }}
          placeholder={t('placeholder')}
          value={field.value}
        />
      )}
    />
  );
};

export default CountryField;
