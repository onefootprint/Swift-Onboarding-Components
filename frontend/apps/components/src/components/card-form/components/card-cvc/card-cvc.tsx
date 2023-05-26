/* eslint-disable react/jsx-props-no-spreading */
import { InputProps, InternalInput } from '@onefootprint/ui';
import React, { forwardRef, useState } from 'react';

export type CvcLength = 3 | 4;

export type CardCvcProps = Omit<
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
  numDigits: CvcLength;
  invalidMessage?: string;
};

const CardCvc = forwardRef<HTMLInputElement, CardCvcProps>(
  (
    {
      numDigits,
      hasError,
      hint,
      onChange,
      onBlur,
      invalidMessage = 'Invalid CVC',
      label = 'CVC',
      value,
      ...props
    }: CardCvcProps,
    ref,
  ) => {
    const [blurred, setBlurred] = useState(false);
    const shouldShowError = blurred && hasError;
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
        autoComplete="cc-csc"
        className="fp-input-cvc"
        hasError={hasError}
        hint={errorMessage || hint}
        inputMode="numeric"
        label={label}
        mask={{ numericOnly: true, blocks: [numDigits] }}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder={numDigits === 3 ? '123' : '1234'}
        ref={ref}
        size="default"
        value={value}
        key={numDigits}
      />
    );
  },
);

export default CardCvc;
