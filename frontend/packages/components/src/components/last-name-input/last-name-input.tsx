import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React, { forwardRef } from 'react';

export type LastNameInputProps = InputHTMLAttributes<HTMLInputElement>;

const LastNameInput = forwardRef<HTMLInputElement, LastNameInputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      autoComplete="family-name"
      className={cx('fp-last-name-input', className)}
      {...props}
    />
  ),
);

export default LastNameInput;
