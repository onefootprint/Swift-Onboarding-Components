import { useTranslation } from '@onefootprint/hooks';
import { CountrySelect } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useL10nContext } from '../../../../../../components/l10n-provider';

type NationalityFieldProps = {
  disabled?: boolean;
};

const NationalityField = ({ disabled }: NationalityFieldProps) => {
  const { t } = useTranslation('pages.basic-information.form.nationality');
  const { control } = useFormContext();
  const l10n = useL10nContext();

  return (
    <Controller
      data-private
      control={control}
      name="nationality"
      render={({ field }) => (
        <CountrySelect
          disabled={disabled}
          label={t('label')}
          onBlur={field.onBlur}
          placeholder={t('placeholder')}
          onChange={nextValue => {
            field.onChange(nextValue);
          }}
          value={field.value}
          locale={l10n?.locale}
        />
      )}
    />
  );
};

export default NationalityField;
