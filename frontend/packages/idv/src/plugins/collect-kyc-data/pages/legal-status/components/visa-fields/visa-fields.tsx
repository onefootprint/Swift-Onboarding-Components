import { useInputMask } from '@onefootprint/hooks';
import { VisaKind } from '@onefootprint/types';
import { Select, TextInput } from '@onefootprint/ui';
import { isValid } from 'date-fns';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useL10nContext } from '../../../../../../components/l10n-provider';
import type { FormData } from '../../types';

const VisaFields = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyc.pages.legal-status.form',
  });
  const {
    control,
    formState: { errors },
    register,
    getValues,
  } = useFormContext<FormData>();
  const l10n = useL10nContext();
  const inputMasks = useInputMask(l10n?.locale);

  const options = Object.values(VisaKind).map(value => ({
    label: t(`visa-kind.mapping.${value}`),
    value,
  }));

  const getHint = (field: string) => {
    if (errors.visa) {
      const { message } = errors.visa;
      if (message && typeof message === 'string') {
        return message;
      }
      if (field === 'kind' && errors.visa.kind) {
        return t('visa-kind.error');
      }
      if (field === 'expirationDate' && errors.visa.expirationDate) {
        return t(
          `visa-expiration.error.${errors.visa.expirationDate.type}` as unknown as TemplateStringsArray,
        ) as unknown as string;
      }
    }
    return undefined;
  };
  const kindErrorMessage = getHint('kind');
  const expirationErrorMessage = getHint('expirationDate');

  return (
    <>
      <Controller
        data-private
        data-dd-privacy="mask"
        control={control}
        name="visa.kind"
        rules={{ required: true }}
        render={({ field }) => (
          <Select
            data-private
            data-dd-privacy="mask"
            label={t('visa-kind.label')}
            onBlur={field.onBlur}
            options={options}
            onChange={field.onChange}
            hint={kindErrorMessage}
            hasError={!!kindErrorMessage}
            placeholder={t('visa-kind.placeholder')}
            value={field.value}
            testID="visa-kind-select"
          />
        )}
      />
      <TextInput
        data-private
        data-dd-privacy="mask"
        hasError={!!expirationErrorMessage}
        hint={expirationErrorMessage}
        label={t('visa-expiration.label')}
        mask={inputMasks.visaExpiration}
        placeholder={inputMasks.visaExpiration.placeholder}
        value={getValues('visa.expirationDate')}
        {...register('visa.expirationDate', {
          required: true,
          validate: {
            invalid: input => input && isValid(new Date(input)),
            invalidTimeframe: input =>
              input && new Date(input).getFullYear() > 1900 && new Date(input).getFullYear() < 3000,
          },
        })}
        testID="visa-expiration-textinput"
      />
    </>
  );
};

export default VisaFields;
