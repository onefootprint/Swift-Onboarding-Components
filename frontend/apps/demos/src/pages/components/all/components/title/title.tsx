import { Text } from '@onefootprint/ui';
import React from 'react';

type TitleProps = {
  children: React.ReactNode;
};

const Title = ({ children }: TitleProps) => (
  <Text
    variant="heading-2"
    sx={{ textAlign: 'left', width: '100%', margin: 4 }}
  >
    {children}
  </Text>
);

export default Title;
