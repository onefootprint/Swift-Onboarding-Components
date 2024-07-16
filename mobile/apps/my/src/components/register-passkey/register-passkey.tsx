import { IcoFaceid40 } from '@onefootprint/icons';
import type { PasskeyAttemptContext } from '@onefootprint/types';
import { SkipLivenessClientType, SkipLivenessReason } from '@onefootprint/types';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import { Passkey } from 'react-native-passkey';

import useRequestError from '@/hooks/use-request-error';
import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

import useRegisterPasskey, { isRegisterPasskeyError } from './hooks/use-register-passkey';
import useSkipPasskey from './hooks/use-skip-passkey';

export type PasskeysProps = {
  authToken: string;
  onDone: (deviceResponseJson?: string | null) => void;
};

const RegisterPasskey = ({ authToken, onDone }: PasskeysProps) => {
  const { t } = useTranslation('components.passkeys.register');
  const { t: tRetry } = useTranslation('components.passkeys.retry');
  const { getErrorMessage } = useRequestError();
  const registerMutation = useRegisterPasskey();
  const skipMutation = useSkipPasskey();
  const analytics = useAnalytics();
  const isSupported = Passkey.isSupported();

  const [passkeyRegisterAttempts, setPasskeyRegisterAttempts] = useState<PasskeyAttemptContext[]>([]);

  const handleRegister = () => {
    analytics.track(Events.PasskeysRegistrationStarted);
    registerMutation.mutate(authToken, {
      onSuccess: deviceResponseJson => {
        analytics.track(Events.PasskeyRegistrationSucceeded);
        analytics.track(Events.FPasskeyCompleted, { result: 'success' });
        onDone(deviceResponseJson);
      },
      onError: (error: unknown) => {
        // Extract context from RegisterPasskeyError if relevant
        let e = error;
        let elapsedTimeInOsPromptMs;
        if (isRegisterPasskeyError(error)) {
          e = error.error;
          elapsedTimeInOsPromptMs = error.elapsedTimeInOsPromptMs;
        }

        const message = getErrorMessage(e);
        analytics.track(Events.PasskeyRegistrationFailed, {
          message,
        });

        // Keep track of each failed attempt to register a passkey.
        // We will send this to the backend
        const passkeyFailure = {
          errorMessage: message,
          elapsedTimeInOsPromptMs,
        };
        setPasskeyRegisterAttempts([...passkeyRegisterAttempts, passkeyFailure]);
      },
    });
  };

  const skipPasskeyRegister = (reason: SkipLivenessReason) => {
    const context = {
      reason,
      clientType: SkipLivenessClientType.mobile,
      numAttempts: passkeyRegisterAttempts.length,
      attempts: passkeyRegisterAttempts,
    };
    const onSuccess = () => {
      onDone(null);
    };
    skipMutation.mutate({ authToken, context }, { onSuccess });
  };
  const handleDoLater = () => {
    analytics.track(Events.PasskeyRegistrationSkipped);
    analytics.track(Events.FPasskeyCompleted, { result: 'skip' });
    skipPasskeyRegister(SkipLivenessReason.failed);
  };
  const handleNotSupported = () => {
    analytics.track(Events.PasskeyRegistrationNotSupported);
    analytics.track(Events.FPasskeyCompleted, { result: 'not_supported' });
    skipPasskeyRegister(SkipLivenessReason.unavailableOnDevice);
  };

  useEffect(() => {
    if (!isSupported) {
      handleNotSupported();
    }
  }, []);

  let title;
  let subtitle;
  let primaryButtonText;
  let secondaryButtonText;
  if (!passkeyRegisterAttempts.length) {
    // First attempt
    title = t('title');
    subtitle = t('subtitle');
    primaryButtonText = t('cta');
  } else {
    // Failed initial attempt - show retry copy
    title = tRetry('title');
    subtitle = tRetry('subtitle');
    primaryButtonText = tRetry('cta');
    secondaryButtonText = tRetry('skip');
  }

  return (
    <Container center>
      <IcoFaceid40 />
      <Typography variant="heading-3" marginBottom={3} marginTop={4} center>
        {title}
      </Typography>
      <Typography variant="body-3" marginBottom={9} center color="secondary">
        {subtitle}
      </Typography>
      <Box gap={4} width="100%">
        <Button
          onPress={handleRegister}
          loading={registerMutation.isLoading}
          disabled={skipMutation.isLoading || registerMutation.isLoading}
        >
          {primaryButtonText}
        </Button>
        {secondaryButtonText && (
          <Button
            onPress={handleDoLater}
            loading={skipMutation.isLoading}
            disabled={skipMutation.isLoading || registerMutation.isLoading}
            variant="secondary"
          >
            {secondaryButtonText}
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default RegisterPasskey;
