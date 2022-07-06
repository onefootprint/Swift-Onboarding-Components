import { useTranslation } from 'hooks';
import React from 'react';
import HeaderTitle from 'src/components/header-title';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

const BiometricLivenessCheck = () => {
  const { t } = useTranslation('pages.liveness-check.biometric-register');
  const handleClick = () => {
    // TODO: implement liveness check
    // https://linear.app/footprint/issue/FP-497/biometric-verification
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Button onClick={handleClick} fullWidth>
        {t('cta')}
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

export default BiometricLivenessCheck;
