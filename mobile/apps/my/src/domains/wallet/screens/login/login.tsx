import { LogoFpDefault } from '@onefootprint/icons';
import { Box, Button, Container } from '@onefootprint/ui';
import React from 'react';

const Login = () => {
  return (
    <Container center>
      <LogoFpDefault />
      <Box width="100%" marginTop={9}>
        <Button>Continue with Footprint</Button>
      </Box>
    </Container>
  );
};

export default Login;
