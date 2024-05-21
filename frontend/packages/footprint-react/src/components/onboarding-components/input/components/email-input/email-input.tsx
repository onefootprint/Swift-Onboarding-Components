import { isEmail } from '@onefootprint/core';
import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type EmailInputProps = InputHTMLAttributes<HTMLInputElement>;

const identifier = 'id.email';

const EmailInput = ({ className, ...props }: EmailInputProps) => {
  const {
    form: { register },
  } = useFootprint();
  const { t } = useTranslation('common', { keyPrefix: 'email' });

  return (
    <input
      autoComplete="email"
      className={cx('fp-email-input', className)}
      data-nid-target="email"
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
