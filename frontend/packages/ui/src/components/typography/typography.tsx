import * as React from 'react';

export type TypographyProps = {
  children: string;
};

const Button = ({ children }: TypographyProps) => <h1>{children}</h1>;

export default Button;
