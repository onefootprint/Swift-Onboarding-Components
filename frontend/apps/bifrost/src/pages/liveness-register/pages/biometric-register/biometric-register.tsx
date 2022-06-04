import { Events } from '@src/utils/state-machine/liveness-register';
import React from 'react';
import HeaderTitle from 'src/components/header-title';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import styled, { css } from 'styled';
import { Button } from 'ui';

import useBiometricRegister from '../../hooks/use-biometric-register';
import useLivenessRegisterMachine from '../../hooks/use-liveness-check';

const BiometricRegister = () => {
  const [bifrostState] = useBifrostMachine();
  const [, send] = useLivenessRegisterMachine();
  const biometricRegisterMutation = useBiometricRegister();

  const handleClick = () => {
    const { authToken } = bifrostState.context;
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
      <Button onClick={handleClick} fullWidth>
        Launch Face ID
      </Button>
    </Container>
  );
};

export default BiometricRegister;

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
    text-align: center;
  `}
`;
