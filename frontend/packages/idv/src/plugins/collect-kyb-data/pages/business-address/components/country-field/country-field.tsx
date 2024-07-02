import { CountrySelect } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useL10nContext } from '../../../../../../components/l10n-provider';

type CountryFieldProps = {
  onChange: () => void;
};

const CountryField = ({ onChange }: CountryFieldProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.business-address.form.country',
  });
  const l10n = useL10nContext();

  return (
    <Controller
      data-dd-privacy="mask"
      control={control}
      name="country"
      render={({ field }) => (
        <CountrySelect
          label={t('label')}
          onBlur={field.onBlur}
          onChange={nextValue => {
            field.onChange(nextValue);
            onChange();
          }}
          placeholder={t('placeholder')}
          value={field.value}
          // hardcode disabled until we support other countries
          disabled
          hint={t('us-only-hint')}
          locale={l10n?.locale}
        />
      )}
    />
  );
};

export default CountryField;
