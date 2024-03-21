/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { SelectHTMLAttributes } from 'react';
import React, { forwardRef, useId } from 'react';

import Hint from '../../hint';
import Label from '../../label';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  message?: string;
  hasError?: boolean;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, message, hasError, className, id: externalId, ...props }, ref) => {
    const internalId = useId();
    const id = externalId || internalId;
    const hintId = `${id}-description`;

    return (
      <>
        {label ? (
          <Label htmlFor={id} aria-invalid={hasError}>
            {label}
          </Label>
        ) : null}
        <select
          aria-describedby={hintId}
          aria-invalid={hasError}
          className={cx('fp-select', className)}
          id={id}
          ref={ref}
          {...props}
        />
        {message ? (
          <Hint id={hintId} aria-invalid={hasError}>
            {message}
          </Hint>
        ) : null}
      </>
    );
  },
);

export default Select;
