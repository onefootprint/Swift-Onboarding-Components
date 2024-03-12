import { TextInput } from '@onefootprint/ui';
import React from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type EmailFieldProps = { disabled?: boolean };

const getErrorHint = (errors: FieldErrors<FieldValues>) => {
  if (!errors.phoneNumber) return undefined;

  const { message } = errors.phoneNumber;
  return typeof message === 'string' && message ? message : undefined;
};

const PhoneField = ({ disabled }: EmailFieldProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyc.pages.basic-information',
  });
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <TextInput
      data-private
      type="tel"
      hasError={!!errors.phoneNumber}
      disabled={disabled}
      hint={getErrorHint(errors)}
      label={t('form.phone.label')}
      placeholder={t('form.phone.placeholder')}
      defaultValue={getValues('phoneNumber')}
      {...register('phoneNumber', {
        required: {
          value: true,
          message: t('form.phone.error-required'),
        },
      })}
    />
  );
};

export default PhoneField;
