import React, { forwardRef } from 'react';

import Input, { InputProps } from '../internal/input';

export type CvcLengthType = 3 | 4;

export type CardCvcProps = Omit<
  InputProps,
  | 'mask'
  | 'type'
  | 'maxLength'
  | 'minLength'
  | 'placeholder'
  | 'label'
  | 'autoComplete'
  | 'size'
> & {
  numDigits: CvcLengthType;
};

const CardCvc = forwardRef<HTMLInputElement, CardCvcProps>(
  ({ hasError, numDigits, hint, ...props }: CardCvcProps, ref) => (
    <Input
      {...props}
      placeholder={numDigits === 3 ? '123' : '1234'}
      label="CVC"
      hasError={hasError}
      hint={hasError ? hint : undefined}
      mask={{ numericOnly: true, blocks: [numDigits] }}
      ref={ref}
      key={numDigits}
      autoComplete="cc-csc"
      size="default"
    />
  ),
);

export default CardCvc;
