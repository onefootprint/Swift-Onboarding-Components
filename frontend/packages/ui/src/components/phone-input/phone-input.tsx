import React from 'react';

import Input, { InputProps } from '../internal/input';

export type PhoneInputProps = Omit<InputProps, 'type' | 'mask'>;

const PhoneInput = ({ value, ...remainingProps }: PhoneInputProps) => (
  <Input
    {...remainingProps}
    type="tel"
    mask={{
      delimiters: [' ', '(', ')', ' ', '-'],
      blocks: [2, 0, 3, 0, 3, 4],
    }}
  />
);

export default PhoneInput;
