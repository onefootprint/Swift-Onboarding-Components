import { cx } from 'class-variance-authority';
import type { InputHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
  containerClassName?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ containerClassName, hasError, className, id: externalId, ...props }, ref) => {
    const internalId = useId();
    const id = externalId || internalId;
    const hintId = `${id}-description`;

    return (
      <div className={cx('fp-control', containerClassName)}>
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
