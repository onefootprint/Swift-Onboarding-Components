import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../components/header-title';
import { useLivenessMachine } from '../../components/machine-provider';
import useBiometricInit from '../../hooks/use-register-biometric';
import { Events } from '../../utils/state-machine/types';

const Register = () => {
  const { t } = useTranslation('pages.register');
  const [state, send] = useLivenessMachine();
  const { authToken } = state.context;
  const biometricInitMutation = useBiometricInit();

  const handleClick = () => {
    if (!authToken) {
      return;
    }
    biometricInitMutation.mutate(
      { authToken },
      {
        onSuccess() {
          send({ type: Events.succeeded });
        },
        onError() {
          send({ type: Events.failed });
        },
      },
    );
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Button
        loading={biometricInitMutation.isLoading}
        onClick={handleClick}
        fullWidth
      >
        {t('cta')}
      </Button>
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[8]};
  `}
`;

export default Register;
