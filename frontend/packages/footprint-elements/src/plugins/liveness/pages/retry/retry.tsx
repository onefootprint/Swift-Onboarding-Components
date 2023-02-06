import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { useSkipLiveness } from '../../../../hooks';
import HeaderTitle from '../../components/header-title';
import LivenessSuccess from '../../components/liveness-success';
import useLivenessMachine, { Events } from '../../hooks/use-liveness-machine';
import useBiometricInit from '../../hooks/use-register-biometric';

const SUCCESS_TRANSITION_DELAY_MS = 1500;

const Retry = () => {
  const { t } = useTranslation('pages.retry');
  const [state, send] = useLivenessMachine();
  const { authToken } = state.context;
  const biometricInitMutation = useBiometricInit();
  const skipLivenessMutation = useSkipLiveness();

  const handleSkip = () => {
    if (!authToken) {
      return;
    }
    skipLivenessMutation.mutate(
      { authToken },
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
          setTimeout(() => {
            send({ type: Events.succeeded });
          }, SUCCESS_TRANSITION_DELAY_MS);
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
      {biometricInitMutation.isSuccess ? (
        <LivenessSuccess />
      ) : (
        <ButtonsContainer>
          <Button
            onClick={handleRetry}
            loading={biometricInitMutation.isLoading}
            disabled={
              biometricInitMutation.isLoading || skipLivenessMutation.isLoading
            }
            fullWidth
          >
            {t('cta')}
          </Button>
          <Button
            loading={skipLivenessMutation.isLoading}
            disabled={
              biometricInitMutation.isLoading || skipLivenessMutation.isLoading
            }
            onClick={handleSkip}
            fullWidth
            variant="secondary"
          >
            {t('skip')}
          </Button>
        </ButtonsContainer>
      )}
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[8]};
  `}
`;

const ButtonsContainer = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[4]};
  `}
`;

export default Retry;
