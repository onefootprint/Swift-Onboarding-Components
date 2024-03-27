import { Stack } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

const Layout = ({ children }: React.PropsWithChildren) => (
  <StyledStack
    alignItems="center"
    backgroundColor="secondary"
    direction="column"
    gap={5}
    height="100vh"
    justifyContent="center"
    width="100%"
  >
    {children}
  </StyledStack>
);

const StyledStack = styled(Stack)`
  isolation: isolate;
`;

export default Layout;
