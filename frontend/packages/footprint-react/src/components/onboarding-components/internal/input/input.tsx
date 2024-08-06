import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';

import Label from '../../label';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hasError?: boolean;
  containerClassName?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ containerClassName, label, hasError, className, id: externalId, ...props }, ref) => {
    const internalId = useId();
    const id = externalId || internalId;
    const hintId = `${id}-description`;

    return (
      <div className={cx('fp-control', containerClassName)}>
        {label ? (
          <Label htmlFor={id} aria-invalid={hasError}>
            {label}
          </Label>
        ) : null}
        <input
          aria-describedby={hintId}
          aria-invalid={hasError}
          className={cx('fp-input', className)}
          id={id}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);

export default Input;
