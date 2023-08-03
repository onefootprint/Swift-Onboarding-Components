import { Typography } from '@onefootprint/ui';
import React from 'react';

type TitleProps = {
  children: React.ReactNode;
};

const Title = ({ children }: TitleProps) => (
  <Typography
    variant="heading-2"
    sx={{ textAlign: 'left', width: '100%', margin: 4 }}
  >
    {children}
  </Typography>
);

export default Title;
