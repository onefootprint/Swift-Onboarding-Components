import { Stack, Text } from '@onefootprint/ui';
import React from 'react';

const Header = ({ children }: React.PropsWithChildren) => (
  <Stack
    center
    borderBottomWidth={1}
    borderColor="tertiary"
    borderStyle="solid"
    flexShrink={0}
    height="48px"
    position="sticky"
    backgroundColor="primary"
    top="0px"
    zIndex={1}
  >
    <Text variant="label-2">{children}</Text>
  </Stack>
);

export default Header;
