import * as React from 'react';

type TypographyProps = {
  children: string;
};

const Typography = ({ children }: TypographyProps) => <h2>{children}</h2>;

export default Typography;
