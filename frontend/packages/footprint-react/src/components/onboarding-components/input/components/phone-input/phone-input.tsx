import { isPhoneNumber } from '@onefootprint/core';
import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type PhoneInputProps = InputHTMLAttributes<HTMLInputElement>;

const identifier = 'id.phone_number';

const PhoneInput = ({ className, ...props }: PhoneInputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'phone' });
  const {
    form: { register },
  } = useFootprint();

  return (
    <input
      autoComplete="tel"
      className={cx('fp-phone-input', className)}
      placeholder={t('placeholder')}
      type="tel"
      {...props}
      {...register(identifier, {
        required: t('errors.required'),
        validate: value => isPhoneNumber(value) || t('errors.invalid'),
      })}
    />
  );
};

export default PhoneInput;
