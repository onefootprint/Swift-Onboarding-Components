import {
  HeaderTitle,
  NavigationHeader,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import useBiometricLoginRetry from './hooks/use-biometric-login-retry';

const BiometricLoginRetry = () => {
  const { t } = useTranslation('pages.biometric-login-retry');
  const [requestBiometricChallenge, requestPhoneChallenge] =
    useBiometricLoginRetry();

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <ButtonContainer>
          <Button onClick={requestBiometricChallenge} fullWidth>
            {t('cta')}
          </Button>
          <Button onClick={requestPhoneChallenge} variant="secondary" fullWidth>
            {t('use-phone')}
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
    row-gap: ${theme.spacing[4]};
  `}
`;

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;
