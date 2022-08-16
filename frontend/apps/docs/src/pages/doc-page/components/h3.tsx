import kebabCase from 'lodash/kebabCase';
import React from 'react';
import { Typography } from 'ui';

type H3Props = {
  children: string;
};

const H3 = ({ children }: H3Props) => {
  const anchor = `#${kebabCase(children)}`;

  return (
    <Typography as="h3" id={anchor} sx={{ marginBottom: 7 }} variant="label-1">
      {children}
    </Typography>
  );
};

export default H3;
