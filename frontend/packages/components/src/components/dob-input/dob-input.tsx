import cx from 'classnames';
import React from 'react';

import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type DobInputProps = InputProps;

const DobInput = ({ className, ...props }: DobInputProps) => (
  <Input
    inputMode="numeric"
    autoComplete="bday"
    className={cx('fp-dob-input', className)}
    {...props}
  />
);

export default DobInput;
