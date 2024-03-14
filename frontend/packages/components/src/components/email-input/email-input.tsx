import cx from 'classnames';
import React from 'react';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type EmailInputProps = InputProps;

const EmailInput = ({ className, ...props }: EmailInputProps) => {
  const { form } = useFootprint();

  return (
    <Input
      type="email"
      autoComplete="email"
      className={cx('fp-email-input', className)}
      {...props}
      {...form.register('id.email', { required: true })}
    />
  );
};

export default EmailInput;
