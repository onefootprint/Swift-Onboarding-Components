import cx from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type PhoneInputProps = InputProps;

const PhoneInput = ({ className, ...props }: PhoneInputProps) => {
  const { form } = useFootprint();
  const { t } = useTranslation('common');

  return (
    <Input
      autoComplete="tel"
      className={cx('fp-phone-input-input', className)}
      label={t('phone.label')}
      type="tel"
      {...props}
      {...form.register('id.phone_number', { required: true })}
    />
  );
};

export default PhoneInput;
