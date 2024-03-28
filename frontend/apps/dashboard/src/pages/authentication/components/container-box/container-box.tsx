import { Stack } from '@onefootprint/ui';
import React from 'react';

type ContainerBoxProps = {
  children: React.ReactNode;
};

const ContainerBox = ({ children }: ContainerBoxProps) => (
  <Stack
    direction="column"
    gap={7}
    zIndex={1}
    position="relative"
    backgroundColor="primary"
    borderRadius="lg"
    borderWidth={1}
    borderStyle="solid"
    borderColor="tertiary"
    padding={8}
    elevation={1}
    width="100%"
  >
    {children}
  </Stack>
);

export default ContainerBox;
