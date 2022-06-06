import { Events } from '@src/utils/state-machine/liveness-register';
import React from 'react';
import HeaderTitle from 'src/components/header-title';
import styled, { css } from 'styled';
import { Box, Button } from 'ui';

import useBiometricRegister from '../../hooks/use-biometric-register';
import useLivenessRegisterMachine from '../../hooks/use-liveness-register';

const BiometricRegisterFailure = () => {
  const [state, send] = useLivenessRegisterMachine();
  const biometricRegisterMutation = useBiometricRegister();

  const handleBiometricCheck = () => {
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
  const handleCaptchaCheck = () => {
    // TODO: implement
    // https://linear.app/footprint/issue/FP-163/integrate-captcha
    send({ type: Events.captchaRegisterSucceeded });
  };

  return (
    <Container>
      <HeaderTitle
        title="Face not recognized"
        subtitle="We were not able to recognize your face. Please try again."
      />
      <Box>
        <Box sx={{ marginBottom: 4 }}>
          <Button onClick={handleBiometricCheck} fullWidth>
            Try Face ID again
          </Button>
        </Box>
        <Button onClick={handleCaptchaCheck} variant="secondary" fullWidth>
          Fill out captcha
        </Button>
      </Box>
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default BiometricRegisterFailure;
