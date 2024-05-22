import { CountrySelect } from '@onefootprint/ui';
import React from 'react';
import type { FieldError } from 'react-hook-form';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useL10nContext } from '../../../../../../components/l10n-provider';

const CountryOfBirthField = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyc.pages.legal-status.form.nationality',
  });
  const { control } = useFormContext();
  const l10n = useL10nContext();

  const getHint = (error?: FieldError) => {
    if (!error) {
      return undefined;
    }
    const { message } = error;
    if (message && typeof message === 'string') {
      return message;
    }
    return t('error');
  };

  return (
    <Controller
      data-private
      data-dd-privacy="mask"
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
          label={t('label')}
          onBlur={field.onBlur}
          placeholder={t('placeholder')}
          onChange={({ label, value }) => field.onChange({ label, value })}
          value={field.value}
          hasError={!!error}
          hint={getHint(error)}
          testID="nationality-select"
          locale={l10n?.locale}
        />
      )}
    />
  );
};

export default CountryOfBirthField;
