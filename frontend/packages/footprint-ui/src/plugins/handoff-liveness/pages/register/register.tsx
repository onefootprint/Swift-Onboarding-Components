import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import { useIsMutating } from '@tanstack/react-query';
import React from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../components/header-title';
import useRegisterBiometric from '../../hooks/use-register-biometric';

const Register = () => {
  const { t } = useTranslation('pages.register');
  const isMutating = useIsMutating();
  const registerBiometric = useRegisterBiometric();

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Button loading={!!isMutating} onClick={registerBiometric} fullWidth>
        {t('cta')}
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

export default Register;
