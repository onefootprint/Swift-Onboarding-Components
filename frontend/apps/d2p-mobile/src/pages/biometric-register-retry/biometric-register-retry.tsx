import React from 'react';
import HeaderTitle from 'src/components/header-title';
import useBiometricRegister from 'src/hooks/use-biometric-register';
import useD2pMobileMachine, { Events } from 'src/hooks/use-d2p-mobile-machine';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

const BiometricRegisterRetry = () => {
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
      },
    );
  };

  return (
    <Container>
      <HeaderTitle
        title="Biometrics not recognized"
        subtitle="Please try again."
      />
      <Button onClick={handleBiometricRegister} fullWidth>
        Try again
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

export default BiometricRegisterRetry;
