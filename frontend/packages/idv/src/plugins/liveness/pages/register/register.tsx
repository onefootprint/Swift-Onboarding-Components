import { IcoPasskey40, IcoWarning40 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import { UserChallengeActionKind } from '@onefootprint/types';
import type { PasskeyAttemptContext } from '@onefootprint/types/src/api/skip-liveness';
import { SkipLivenessClientType, SkipLivenessReason } from '@onefootprint/types/src/api/skip-liveness';
import { BottomSheet, Box, Button, LinkButton, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import { useSkipLiveness } from '../../../../queries';
import { FPCustomEvents, sendCustomEvent } from '../../../../utils/custom-event';
import { getLogger, trackAction } from '../../../../utils/logger';
import LivenessSuccess from '../../components/liveness-success';
import useLivenessMachine from '../../hooks/use-liveness-machine';
import useBiometricInit, { isRegisterPasskeyError } from '../../hooks/use-register-biometric';

const SUCCESS_TRANSITION_DELAY_MS = 2500;
const { logError, logInfo, logTrack, logWarn } = getLogger({
  location: 'liveness-register',
});

const Register = ({
  actionKind,
  onCustomSkip,
}: {
  actionKind: UserChallengeActionKind;
  onCustomSkip?: () => void;
}) => {
  const { t } = useTranslation('idv', { keyPrefix: 'liveness.pages.register' });
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [state, send] = useLivenessMachine();
  const {
    idvContext: { authToken },
  } = state.context;
  const biometricInitMutation = useBiometricInit();
  const skipLivenessMutation = useSkipLiveness();

  const [passkeyRegisterAttempts, setPasskeyRegisterAttempts] = useState<PasskeyAttemptContext[]>([]);

  const handleOpenBottomSheet = () => {
    setShowBottomSheet(true);
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
  };

  const handleRegister = () => {
    if (biometricInitMutation.isLoading) {
      return;
    }

    biometricInitMutation.mutate(
      { authToken, actionKind },
      {
        onSuccess({ deviceResponseJson }) {
          logTrack('Passkeys registration succeeded');
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
          logWarn(`Failed to register passkeys for user: ${errorMessage}`, e);
          // Keep track of each failed attempt to register a passkey.
          // We will send this to the backend
          const passkeyFailure = {
            errorMessage,
            elapsedTimeInOsPromptMs,
          };
          setPasskeyRegisterAttempts([...passkeyRegisterAttempts, passkeyFailure]);
        },
      },
    );
  };

  const handleCustomSkip = () => {
    trackAction('passkeys:skipped');
    logInfo('Skipping liveness after retrying registering passkeys');
    send({ type: 'skipped' });
    onCustomSkip?.();
  };

  const handleSkip = () => {
    trackAction('passkeys:skipped');
    if (skipLivenessMutation.isLoading) {
      return;
    }
    logInfo('Skipping liveness after retrying registering passkeys');
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
        onError: (err: unknown) => {
          logError(`Failed to skip liveness after retrying registering passkeys: ${getErrorMessage(err)}`, err);
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
    headerTitle = actionKind === UserChallengeActionKind.replace ? t('title-replace') : t('title-add');
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
              disabled={biometricInitMutation.isLoading || skipLivenessMutation.isLoading}
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
              disabled={biometricInitMutation.isLoading || skipLivenessMutation.isLoading}
              onClick={typeof onCustomSkip === 'function' ? handleCustomSkip : handleSkip}
              fullWidth
              size="large"
              variant="secondary"
            >
              {secondaryButtonText}
            </Button>
          )}
          {!biometricInitMutation.isSuccess && (
            <Stack alignItems="center" width="100%" justify="center" paddingTop={3}>
              <LinkButton onClick={handleOpenBottomSheet}>{t('learn-more.cta')}</LinkButton>
            </Stack>
          )}
          <BottomSheet open={showBottomSheet} onClose={handleCloseBottomSheet} title={t('learn-more.title')}>
            <Stack gap={3} direction="column" marginBottom={5}>
              <Text variant="body-3" whiteSpace="pre-wrap">
                {t('learn-more.content-1')}
              </Text>
              <Text variant="body-3" whiteSpace="pre-wrap">
                {t('learn-more.content-2')}
              </Text>
            </Stack>
          </BottomSheet>
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
