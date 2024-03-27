import { isEmail } from '@onefootprint/core';
import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type EmailInputProps = InputProps;

const EmailInput = ({ className, ...props }: EmailInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'email' });
  const error = errors.email;

  return (
    <Input
      autoComplete="email"
      className={cx('fp-email-input', className)}
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      type="email"
      data-nid-target="email"
      {...props}
      {...register('email', {
        required: t('errors.required'),
        validate: (value = '') => isEmail(value) || t('errors.invalid'),
      })}
    />
  );
};

export default EmailInput;
