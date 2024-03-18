import { IcoWarning40 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import { Box, Button, Grid } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import { useSkipLiveness } from '../../../../hooks';
import {
  FPCustomEvents,
  sendCustomEvent,
} from '../../../../utils/custom-event';
import Logger from '../../../../utils/logger';
import LivenessSuccess from '../../components/liveness-success';
import useLivenessMachine from '../../hooks/use-liveness-machine';
import useBiometricInit from '../../hooks/use-register-biometric';

const SUCCESS_TRANSITION_DELAY_MS = 1500;

const Retry = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'liveness.pages.retry' });
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
        onSuccess({ deviceResponseJson }) {
          setTimeout(() => {
            sendCustomEvent(FPCustomEvents.receivedDeviceResponseJson, {
              deviceResponseJson,
            });
            send({ type: 'succeeded' });
          }, SUCCESS_TRANSITION_DELAY_MS);
        },
        onError(error: unknown) {
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
    <Container>
      <Grid.Container as="form">
        <NavigationHeader />
        {biometricInitMutation.isSuccess ? (
          <>
            <HeaderTitle
              title={t('success-title')}
              subtitle={t('success-subtitle')}
            />
            <LivenessSuccess />
          </>
        ) : (
          <>
            <Box marginTop={4} marginBottom={4}>
              <IcoWarning40 color="error" />
            </Box>
            <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
            <Grid.Container marginTop={8} gap={4}>
              <Button
                onClick={handleRetry}
                loading={biometricInitMutation.isLoading}
                disabled={
                  biometricInitMutation.isLoading ||
                  skipLivenessMutation.isLoading
                }
                fullWidth
                size="large"
              >
                {t('cta')}
              </Button>
              <Button
                loading={skipLivenessMutation.isLoading}
                disabled={
                  biometricInitMutation.isLoading ||
                  skipLivenessMutation.isLoading
                }
                onClick={handleSkip}
                fullWidth
                size="large"
                variant="secondary"
              >
                {t('skip')}
              </Button>
            </Grid.Container>
          </>
        )}
      </Grid.Container>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  text-align: center;
`;

export default Retry;
