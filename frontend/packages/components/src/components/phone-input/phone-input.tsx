import cx from 'classnames';
import React from 'react';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type PhoneInputProps = InputProps;

const PhoneInput = ({ className, ...props }: PhoneInputProps) => {
  const { form } = useFootprint();

  return (
    <Input
      type="tel"
      autoComplete="tel"
      className={cx('fp-phone-input-input', className)}
      {...props}
      {...form.register('id.phone_number', { required: true })}
    />
  );
};

export default PhoneInput;
