import { TextInput } from '@onefootprint/ui';
import React from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type EmailFieldProps = { disabled?: boolean };

const getErrorHint = (errors: FieldErrors<FieldValues>) => {
  if (!errors.email) return undefined;

  const { message } = errors.email;
  return typeof message === 'string' && message ? message : undefined;
};

const EmailField = ({ disabled }: EmailFieldProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.email' });
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <TextInput
      data-nid-target="email"
      data-dd-privacy="mask"
      defaultValue={getValues('email')}
      disabled={disabled}
      hasError={!!errors.email}
      hint={getErrorHint(errors)}
      label={t('email.label')}
      placeholder={t('email.placeholder')}
      type="email"
      {...register('email', {
        required: {
          value: true,
          message: t('email.errors.required'),
        },
      })}
    />
  );
};

export default EmailField;
