import { Button, Container } from '@onefootprint/ui';
import React from 'react';
import { NativeModules } from 'react-native';

const DeviceSignals = () => {
  const handlePress = () => {
    const webauthnPublicKey = 'yourWebauthnPublicKey';
    const challenge = 'yourchallenge';
    NativeModules.DeviceAttestation.attest(
      webauthnPublicKey,
      challenge,
      (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log(result);
      },
    );
  };

  return (
    <Container>
      <Button onPress={handlePress}>Get device signals</Button>
    </Container>
  );
};

export default DeviceSignals;
