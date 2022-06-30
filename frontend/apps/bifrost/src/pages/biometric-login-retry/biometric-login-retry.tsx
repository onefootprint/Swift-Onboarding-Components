import React from 'react';
import HeaderTitle from 'src/components/header-title';
import NavigationHeader from 'src/components/navigation-header';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

import useBiometricLoginRetry from './hooks/use-biometric-login-retry';

const BiometricLoginRetry = () => {
  const [requestBiometricChallenge, requestPhoneChallenge] =
    useBiometricLoginRetry();

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirm: true }} />
      <Container>
        <HeaderTitle
          title="Face not recognized"
          subtitle="You can try Face ID again or you can use your phone number to complete your authentication."
        />
        <ButtonContainer>
          <Button onClick={requestBiometricChallenge} fullWidth>
            Try Face ID again
          </Button>
          <Button onClick={requestPhoneChallenge} variant="secondary" fullWidth>
            Use phone number
          </Button>
        </ButtonContainer>
      </Container>
    </>
  );
};

export default BiometricLoginRetry;

const ButtonContainer = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[4]}px;
  `}
`;

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;
