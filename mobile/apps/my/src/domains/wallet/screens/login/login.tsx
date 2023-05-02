import { LogoFpDefault } from '@onefootprint/icons';
import { Box, Button, Container } from '@onefootprint/ui';
import React from 'react';

import type { ScreenProps } from '@/wallet/wallet.types';

type LoginProps = ScreenProps<'Login'>;

const Login = ({ navigation }: LoginProps) => {
  const handlePress = () => {
    navigation.replace('MainTabs');
  };

  return (
    <Container center>
      <LogoFpDefault />
      <Box width="100%" marginTop={9}>
        <Button onPress={handlePress} variant="secondary">
          Continue using Footprint
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
