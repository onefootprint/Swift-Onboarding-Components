import { Events } from '@src/utils/state-machine/liveness-register';
import React from 'react';
import HeaderTitle from 'src/components/header-title';
import styled, { css } from 'styled';
import { Button } from 'ui';

import useBiometricRegister from '../../hooks/use-biometric-register';
import useLivenessRegisterMachine from '../../hooks/use-liveness-register';

const BiometricRegister = () => {
  const [state, send] = useLivenessRegisterMachine();
  const biometricRegisterMutation = useBiometricRegister();

  const handleClick = () => {
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
      <Button onClick={handleClick} fullWidth>
        Launch Face ID
      </Button>
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
    text-align: center;
  `}
`;

export default BiometricRegister;
