import type { InputHTMLAttributes } from 'react';
import React, { forwardRef } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  // TODO: Add mask
};

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input ref={ref} {...props} />
));

export default Input;
