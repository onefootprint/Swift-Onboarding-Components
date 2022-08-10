import { HeaderTitle } from 'footprint-ui';
import { useTranslation } from 'hooks';
import React from 'react';
import NavigationHeader from 'src/components/navigation-header';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

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
    row-gap: ${theme.spacing[4]}px;
  `}
`;

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;
