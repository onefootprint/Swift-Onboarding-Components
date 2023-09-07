import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import { useSkipLiveness } from '../../../../hooks';
import LivenessSuccess from '../../components/liveness-success';
import useLivenessMachine from '../../hooks/use-liveness-machine';
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
          send({ type: 'skipped' });
        },
        onError: (error: unknown) => {
          console.error(
            'Failed to skip liveness after retrying registering passkeys',
            getErrorMessage(error),
          );
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
            send({ type: 'succeeded' });
          }, SUCCESS_TRANSITION_DELAY_MS);
        },
        onError(error: unknown) {
          console.error(
            'Failed to register passkeys for user while retrying',
            getErrorMessage(error),
          );
          send({ type: 'failed' });
        },
      },
    );
  };

  return (
    <Container>
      <NavigationHeader />
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

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[4]};
  `}
`;

export default Retry;
