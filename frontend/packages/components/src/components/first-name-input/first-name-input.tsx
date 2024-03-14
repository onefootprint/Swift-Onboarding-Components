import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React, { forwardRef } from 'react';

export type FirstNameInputProps = InputHTMLAttributes<HTMLInputElement> & {
  // TODO: Add mask
};

const FirstNameInput = forwardRef<HTMLInputElement, FirstNameInputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      autoComplete="given-name"
      className={cx('fp-first-name-input', className)}
      {...props}
    />
  ),
);

export default FirstNameInput;
