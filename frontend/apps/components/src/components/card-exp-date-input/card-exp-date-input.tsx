/* eslint-disable react/jsx-props-no-spreading */
import { InputProps, InternalInput } from '@onefootprint/ui';
import { isPast, parse } from 'date-fns';
import React, { forwardRef, useState } from 'react';

export type CardExpDateInputProps = Omit<
  InputProps,
  | 'autoComplete'
  | 'inputMode'
  | 'mask'
  | 'maxLength'
  | 'minLength'
  | 'placeholder'
  | 'size'
  | 'type'
> & {
  invalidMessage?: string;
};

const CardExpDateInput = forwardRef<HTMLInputElement, CardExpDateInputProps>(
  (
    {
      hasError,
      hint,
      onChange,
      onBlur,
      invalidMessage = 'Date must be in the future',
      label = 'Exp. Date',
      value,
      ...props
    }: CardExpDateInputProps,
    ref,
  ) => {
    const parsedDate = parse(value || '', 'MM/yy', new Date());
    const [blurred, setBlurred] = useState(false);
    const shouldShowError = blurred && (hasError || isPast(parsedDate));
    const errorMessage = shouldShowError ? invalidMessage : undefined;

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setBlurred(true);
      onBlur?.(event);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setBlurred(false);
      onChange?.(event);
    };

    return (
      <InternalInput
        {...props}
        autoComplete="cc-exp"
        className="fp-input-exp-date"
        hasError={shouldShowError}
        hint={errorMessage || hint}
        inputMode="numeric"
        label={label}
        mask={{
          date: true,

          datePattern: ['m', 'y'],
        }}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="MM / YY"
        ref={ref}
        size="default"
        value={value}
      />
    );
  },
);

export default CardExpDateInput;
