import cx from 'classnames';
import React, { forwardRef } from 'react';

import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type DobInputProps = InputProps;

const DobInput = forwardRef<HTMLInputElement, DobInputProps>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      inputMode="numeric"
      autoComplete="bday"
      className={cx('fp-dob-input', className)}
      {...props}
    />
  ),
);

export default DobInput;
