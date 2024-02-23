import { Text } from '@onefootprint/ui';
import React from 'react';

type PProps = {
  children: React.ReactNode;
};

const P = ({ children }: PProps) => (
  <Text variant="body-2" color="secondary" sx={{ marginBottom: 9 }}>
    {children}
  </Text>
);

export default P;
