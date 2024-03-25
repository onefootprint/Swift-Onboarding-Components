import { IcoPasskey40, IcoWarning40 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import type { PasskeyAttemptContext } from '@onefootprint/types/src/api/skip-liveness';
import {
  SkipLivenessClientType,
  SkipLivenessReason,
} from '@onefootprint/types/src/api/skip-liveness';
import { Box, Button, Stack } from '@onefootprint/ui';
import React, { useState } from 'react';
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
import useBiometricInit, {
  isRegisterPasskeyError,
} from '../../hooks/use-register-biometric';

const SUCCESS_TRANSITION_DELAY_MS = 1500;

const Register = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'liveness.pages.register' });
  const [state, send] = useLivenessMachine();
  const { authToken } = state.context;
  const biometricInitMutation = useBiometricInit();
  const skipLivenessMutation = useSkipLiveness();

  const [passkeyRegisterAttempts, setPasskeyRegisterAttempts] = useState<
    PasskeyAttemptContext[]
  >([]);

  const handleRegister = () => {
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
          // Extract context from RegisterPasskeyError if relevant
          let e = error;
          let elapsedTimeInOsPromptMs;
          if (isRegisterPasskeyError(error)) {
            e = error.error;
            elapsedTimeInOsPromptMs = error.elapsedTimeInOsPromptMs;
          }

          const errorMessage = getErrorMessage(e);
          Logger.error(
            `Failed to register passkeys for user: ${errorMessage}`,
            'liveness-register',
          );
          // Keep track of each failed attempt to register a passkey.
          // We will send this to the backend
          const passkeyFailure = {
            errorMessage,
            elapsedTimeInOsPromptMs,
          };
          setPasskeyRegisterAttempts([
            ...passkeyRegisterAttempts,
            passkeyFailure,
          ]);
        },
      },
    );
  };

  const handleSkip = () => {
    if (!authToken || skipLivenessMutation.isLoading) {
      return;
    }
    const context = {
      reason: SkipLivenessReason.failed,
      clientType: SkipLivenessClientType.web,
      numAttempts: passkeyRegisterAttempts.length,
      attempts: passkeyRegisterAttempts,
    };
    skipLivenessMutation.mutate(
      { authToken, context },
      {
        onSuccess: () => {
          send({ type: 'skipped' });
        },
        onError: (error: unknown) => {
          Logger.error(
            `Failed to skip liveness after retrying registering passkeys: ${getErrorMessage(
              error,
            )}`,
            'liveness-register',
          );
        },
      },
    );
  };

  let icon;
  let primaryButtonText;
  let secondaryButtonText;
  let headerTitle;
  let headerSubtitle;
  if (biometricInitMutation.isSuccess) {
    // Finished registering successfully
    icon = <IcoPasskey40 />;
    headerTitle = t('success.title');
    headerSubtitle = t('success.subtitle');
  } else if (!passkeyRegisterAttempts.length) {
    // First attempt - show normal copy
    icon = <IcoPasskey40 />;
    headerTitle = t('title');
    headerSubtitle = t('subtitle');
    primaryButtonText = t('cta');
  } else {
    // Repeat attempt - show retry copy
    icon = <IcoWarning40 color="error" />;
    headerTitle = t('retry.title');
    headerSubtitle = t('retry.subtitle');
    primaryButtonText = t('retry.cta');
    secondaryButtonText = t('retry.skip');
  }

  return (
    <Container>
      <Box>
        <NavigationHeader />
        <Box marginBottom={3}>{icon}</Box>
        <HeaderTitle title={headerTitle} subtitle={headerSubtitle} />
        <Stack direction="column" marginTop={7} width="100%" gap={4}>
          {biometricInitMutation.isSuccess && <LivenessSuccess />}
          {primaryButtonText && (
            <Button
              loading={biometricInitMutation.isLoading}
              disabled={
                biometricInitMutation.isLoading ||
                skipLivenessMutation.isLoading
              }
              onClick={handleRegister}
              fullWidth
              size="large"
            >
              {primaryButtonText}
            </Button>
          )}
          {secondaryButtonText && (
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
              {secondaryButtonText}
            </Button>
          )}
        </Stack>
      </Box>
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

export default Register;
