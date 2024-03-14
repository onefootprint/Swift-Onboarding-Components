import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React from 'react';

export type LastNameInputProps = InputHTMLAttributes<HTMLInputElement>;

const LastNameInput = ({ className, ...props }: LastNameInputProps) => (
  <input
    autoComplete="family-name"
    className={cx('fp-last-name-input', className)}
    {...props}
  />
);

export default LastNameInput;
