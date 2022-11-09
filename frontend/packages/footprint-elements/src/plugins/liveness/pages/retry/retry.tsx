import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { useSkipLiveness } from '../../../../hooks';
import HeaderTitle from '../../components/header-title';
import useLivenessMachine, { Events } from '../../hooks/use-liveness-machine';
import useBiometricInit from '../../hooks/use-register-biometric';

const Retry = () => {
  const { t } = useTranslation('pages.retry');
  const [state, send] = useLivenessMachine();
  const { authToken, tenant } = state.context;
  const biometricInitMutation = useBiometricInit();
  const skipLivenessMutation = useSkipLiveness();

  const handleSkip = () => {
    if (!authToken || !tenant?.pk) {
      return;
    }
    skipLivenessMutation.mutate(
      { authToken, tenantPk: tenant.pk },
      {
        onSuccess: () => {
          send({ type: Events.skipped });
        },
      },
    );
  };

  const handleRetry = () => {
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
        onClick={handleRetry}
        loading={biometricInitMutation.isLoading}
        fullWidth
      >
        {t('cta')}
      </Button>
      <Button
        loading={skipLivenessMutation.isLoading}
        onClick={handleSkip}
        fullWidth
      >
        {t('skip')}
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

export default Retry;
