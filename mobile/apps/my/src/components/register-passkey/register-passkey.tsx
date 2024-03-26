import { IcoFaceid40 } from '@onefootprint/icons';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import { Passkey } from 'react-native-passkey';

import useRequestError from '@/hooks/use-request-error';
import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

import useRegisterPasskey from './hooks/use-register-passkey';
import useSkipPasskey from './hooks/use-skip-passkey';

export type PasskeysProps = {
  authToken: string;
  onDone?: (deviceResponseJson?: string | null) => void;
};

const RegisterPasskey = ({ authToken, onDone }: PasskeysProps) => {
  const handleOnDoneSuccess = (deviceResponseJson: string) => {
    onDone?.(deviceResponseJson);
  };
  const handleOnDoneSkip = () => {
    onDone?.(null);
  };

  const { t } = useTranslation('components.passkeys.register');
  const { t: tRetry } = useTranslation('components.passkeys.retry');
  const { getErrorMessage } = useRequestError();
  const registerMutation = useRegisterPasskey();
  const skipMutation = useSkipPasskey();
  const analytics = useAnalytics();
  const isSupported = Passkey.isSupported();

  const [passkeyRegisterErrors, setPasskeyRegisterErrors] = useState<string[]>(
    [],
  );

  const handleRegister = () => {
    analytics.track(Events.PasskeysRegistrationStarted);
    registerMutation.mutate(authToken, {
      onSuccess: deviceResponseJson => {
        analytics.track(Events.PasskeyRegistrationSucceeded);
        analytics.track(Events.FPasskeyCompleted, { result: 'success' });
        handleOnDoneSuccess(deviceResponseJson);
      },
      onError: (error: unknown) => {
        const message = getErrorMessage(error);
        analytics.track(Events.PasskeyRegistrationFailed, {
          message,
        });
        setPasskeyRegisterErrors([...passkeyRegisterErrors, message]);
      },
    });
  };

  const handleSkip = () => {
    analytics.track(Events.PasskeyRegistrationSkipped);
    analytics.track(Events.FPasskeyCompleted, { result: 'skip' });
    skipMutation.mutate({ authToken }, { onSuccess: handleOnDoneSkip });
  };

  const handleNotSupported = () => {
    analytics.track(Events.PasskeyRegistrationNotSupported);
    analytics.track(Events.FPasskeyCompleted, { result: 'not_supported' });
    skipMutation.mutate({ authToken }, { onSuccess: handleOnDoneSkip });
  };

  useEffect(() => {
    if (!isSupported) {
      handleNotSupported();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let title;
  let subtitle;
  let primaryButtonText;
  let secondaryButtonText;
  if (!passkeyRegisterErrors.length) {
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
            onPress={handleSkip}
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
