import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React, { forwardRef } from 'react';

export type MiddleNameInputProps = InputHTMLAttributes<HTMLInputElement>;

const MiddleNameInput = forwardRef<HTMLInputElement, MiddleNameInputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      autoComplete="additional-name"
      className={cx('fp-middle-name-input', className)}
      {...props}
    />
  ),
);

export default MiddleNameInput;
