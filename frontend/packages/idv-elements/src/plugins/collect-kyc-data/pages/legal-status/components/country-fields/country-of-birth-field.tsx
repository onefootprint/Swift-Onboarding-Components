import { useTranslation } from '@onefootprint/hooks';
import { CountrySelect } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useL10nContext } from '../../../../../../components/l10n-provider';

const CountryOfBirthField = () => {
  const { t } = useTranslation('pages.legal-status.form');
  const { control } = useFormContext();
  const l10n = useL10nContext();

  return (
    <Controller
      data-private
      name="nationality"
      control={control}
      rules={{
        required: true,
        validate: {
          empty: ({ value }) => !!value,
        },
      }}
      render={({ field, fieldState: { error } }) => (
        <CountrySelect
          label={t('nationality.label')}
          onBlur={field.onBlur}
          placeholder={t('nationality.placeholder')}
          onChange={({ label, value }) => field.onChange({ label, value })}
          value={field.value}
          hasError={!!error}
          hint={error && t('nationality.error')}
          testID="nationality-select"
          locale={l10n?.locale}
        />
      )}
    />
  );
};

export default CountryOfBirthField;
