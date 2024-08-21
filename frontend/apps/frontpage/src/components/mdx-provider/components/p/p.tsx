import { Text } from '@onefootprint/ui';
import type React from 'react';

type PProps = {
  children: React.ReactNode;
};

const P = ({ children }: PProps) => (
  <Text variant="body-2" color="secondary" marginBottom={9}>
    {children}
  </Text>
);

export default P;
