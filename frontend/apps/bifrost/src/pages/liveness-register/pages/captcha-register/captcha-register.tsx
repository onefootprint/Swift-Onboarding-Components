import React from 'react';
import HeaderTitle from 'src/components/header-title';
import { Events } from 'src/utils/state-machine/liveness-register';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

import useLivenessRegisterMachine from '../../hooks/use-liveness-register';

const CaptchaCheck = () => {
  const [, send] = useLivenessRegisterMachine();

  const handleClick = () => {
    // TODO: Implement
    // https://linear.app/footprint/issue/FP-163/integrate-captcha
    send({ type: Events.captchaRegisterSucceeded });
  };

  return (
    <Container>
      <HeaderTitle
        title="Liveness check"
        subtitle="We need to verify that you're a real person, but unfortunately your device doesn't support biometric authentication. Please fill out a captcha to continue."
      />
      <Button onClick={handleClick} fullWidth>
        Fill out captcha
      </Button>
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default CaptchaCheck;
