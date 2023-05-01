import { IcoFaceid40 } from '@onefootprint/icons';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React from 'react';

import useRegisterBiometric from './hooks/use-register-biometric';

export type RegisterProps = {
  authToken: string;
  onSuccess?: () => void;
  onError?: () => void;
};

const Register = ({ authToken, onSuccess, onError }: RegisterProps) => {
  const registerBiometric = useRegisterBiometric();

  const handlePress = () => {
    registerBiometric.mutate({ authToken }, { onSuccess, onError });
  };

  return (
    <Container center>
      <IcoFaceid40 />
      <Typography variant="heading-3" marginBottom={3} marginTop={4}>
        Confirm liveness using your passkey
      </Typography>
      <Typography variant="body-3" marginBottom={9} center>
        We use this secure method for making sure your data is only accessed by
        you.
      </Typography>
      <Box width="100%">
        <Button onPress={handlePress}>Launch phones passkeys</Button>
      </Box>
    </Container>
  );
};

export default Register;
