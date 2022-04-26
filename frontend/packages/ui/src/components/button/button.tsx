import * as React from 'react';

export type ButtonProps = {
  children: string;
};

const Button = ({ children }: ButtonProps) => (
  <button type="button">{children}</button>
);

export default Button;
