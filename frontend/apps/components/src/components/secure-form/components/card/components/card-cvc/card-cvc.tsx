/* eslint-disable react/jsx-props-no-spreading */
import { InputProps, InternalInput } from '@onefootprint/ui';
import React, { forwardRef } from 'react';

export type CvcLength = 3 | 4;

export type CardCvcProps = Omit<
  InputProps,
  | 'autoComplete'
  | 'inputMode'
  | 'mask'
  | 'value'
  | 'maxLength'
  | 'minLength'
  | 'placeholder'
  | 'size'
  | 'type'
> & {
  numDigits: CvcLength;
  invalidMessage?: string;
  value?: string;
};

const CardCvc = forwardRef<HTMLInputElement, CardCvcProps>(
  (
    {
      numDigits,
      hasError,
      hint,
      onChange,
      onBlur,
      label = 'CVC',
      value,
      ...props
    }: CardCvcProps,
    ref,
  ) => (
    <InternalInput
      {...props}
      autoComplete="cc-csc"
      className="fp-input-cvc"
      hasError={hasError}
      hint={hint}
      inputMode="numeric"
      label={label}
      mask={{ numericOnly: true, blocks: [numDigits] }}
      placeholder={numDigits === 3 ? '123' : '1234'}
      ref={ref}
      size="default"
      value={value}
      key={numDigits}
    />
  ),
);

export default CardCvc;
