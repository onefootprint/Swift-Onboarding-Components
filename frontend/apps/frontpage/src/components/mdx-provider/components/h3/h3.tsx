import { Text } from '@onefootprint/ui';
import React from 'react';

type H3Props = {
  children: React.ReactNode;
};

const H3 = ({ children }: H3Props) => (
  <Text variant="heading-3" color="primary" marginBottom={3} tag="h3">
    {children}
  </Text>
);

export default H3;
