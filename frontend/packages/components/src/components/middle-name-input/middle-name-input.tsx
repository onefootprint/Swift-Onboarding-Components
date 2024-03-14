import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';

export type MiddleNameInputProps = InputHTMLAttributes<HTMLInputElement>;

const MiddleNameInput = ({ className, ...props }: MiddleNameInputProps) => (
  <input
    autoComplete="additional-name"
    className={cx('fp-middle-name-input', className)}
    {...props}
  />
);

export default MiddleNameInput;
