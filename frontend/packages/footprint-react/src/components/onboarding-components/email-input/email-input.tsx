import { isEmail } from '@onefootprint/core';
import cx from 'classnames';
import get from 'lodash/get';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type EmailInputProps = InputProps;

const identifier = 'id.email';

const EmailInput = ({ className, ...props }: EmailInputProps) => {
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'email' });
  const error = get(errors, identifier);

  return (
    <Input
      autoComplete="email"
      className={cx('fp-email-input', className)}
      data-nid-target="email"
      hasError={!!error}
      label={t('label')}
      message={error?.message}
      placeholder={t('placeholder')}
      type="email"
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
        validate: value => isEmail(value) || t('errors.invalid'),
      })}
    />
  );
};

export default EmailInput;
