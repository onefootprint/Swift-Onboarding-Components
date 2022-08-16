import kebabCase from 'lodash/kebabCase';
import React from 'react';
import { Typography } from 'ui';

type H2Props = {
  children: string;
};

const H2 = ({ children }: H2Props) => {
  const anchor = `#${kebabCase(children)}`;

  return (
    <Typography
      as="h2"
      id={anchor}
      sx={{ marginBottom: 8 }}
      variant="heading-2"
    >
      {children}
    </Typography>
  );
};

export default H2;
