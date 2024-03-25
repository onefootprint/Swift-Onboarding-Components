import { isPhoneNumber } from '@onefootprint/core';
import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type PhoneInputProps = InputProps;

const PhoneInput = ({ className, ...props }: PhoneInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'phone' });
  const error = errors.phoneNumber;

  return (
    <Input
      autoComplete="tel"
      className={cx('fp-phone-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      type="tel"
      {...props}
      {...register('phoneNumber', {
        required: t('errors.required'),
        validate: (value = '') => isPhoneNumber(value) || t('errors.invalid'),
      })}
    />
  );
};

export default PhoneInput;
