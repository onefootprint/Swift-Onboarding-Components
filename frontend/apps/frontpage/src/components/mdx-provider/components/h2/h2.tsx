import { Text } from '@onefootprint/ui';
import React from 'react';

type H2Props = {
  children: React.ReactNode;
};

const H2 = ({ children }: H2Props) => (
  <Text variant="display-3" color="primary" sx={{ marginBottom: 9 }}>
    {children}
  </Text>
);

export default H2;
