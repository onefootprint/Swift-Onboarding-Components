import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';

export type FirstNameInputProps = InputHTMLAttributes<HTMLInputElement>;

const FirstNameInput = ({ className, ...props }: FirstNameInputProps) => (
  <input
    autoComplete="given-name"
    className={cx('fp-first-name-input', className)}
    {...props}
  />
);

export default FirstNameInput;
