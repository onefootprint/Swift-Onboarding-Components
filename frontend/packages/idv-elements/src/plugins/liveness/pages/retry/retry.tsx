import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { Button, Grid } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import { useSkipLiveness } from '../../../../hooks';
import Logger from '../../../../utils/logger';
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
    if (!authToken || skipLivenessMutation.isLoading) {
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
          Logger.error(
            `Failed to skip liveness after retrying registering passkeys: ${getErrorMessage(
              error,
            )}`,
            'liveness-retry',
          );
        },
      },
    );
  };

  const handleRetry = () => {
    if (!authToken || biometricInitMutation.isLoading) {
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
          Logger.error(
            `Failed to register passkeys for user while retrying: ${getErrorMessage(
              error,
            )}`,
            'liveness-retry',
          );
          send({ type: 'failed' });
        },
      },
    );
  };

  return (
    <Grid.Container as="form" rowGap={8}>
      <NavigationHeader />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      {biometricInitMutation.isSuccess ? (
        <LivenessSuccess />
      ) : (
        <Grid.Container rowGap={4}>
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
        </Grid.Container>
      )}
    </Grid.Container>
  );
};

export default Retry;
