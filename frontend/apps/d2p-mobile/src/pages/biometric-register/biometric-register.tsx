import React from 'react';
import HeaderTitle from 'src/components/header-title';
import useBiometricRegister from 'src/hooks/use-biometric-register';
import useD2pMobileMachine, { Events } from 'src/hooks/use-d2p-mobile-machine';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

const BiometricRegister = () => {
  const [state, send] = useD2pMobileMachine();
  const biometricRegisterMutation = useBiometricRegister();

  const handleBiometricRegister = () => {
    const { authToken } = state.context;
    if (!authToken) {
      return;
    }
    biometricRegisterMutation.mutate(
      { authToken },
      {
        onSuccess() {
          send({ type: Events.biometricRegisterSucceeded });
        },
        onError() {
          send({ type: Events.biometricRegisterFailed });
        },
      },
    );
  };

  return (
    <Container>
      <HeaderTitle
        title="Liveness check"
        subtitle="We need to verify that you're a real person."
      />
      <Button onClick={handleBiometricRegister} fullWidth>
        Launch Face ID
      </Button>
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[8]}px;
  `}
`;

export default BiometricRegister;
