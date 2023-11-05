import { IcoFaceid40 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import {
  Box,
  Button,
  Container,
  LinkButton,
  Typography,
} from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { Passkey } from 'react-native-passkey';

import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

import useRegisterPasskeys from '../../hooks/use-register-passkeys';
import useSkipPasskeys from '../../hooks/use-skip-passkeys';
import Success from '../success';

export type RegisterProps = {
  authToken: string;
  onSuccess?: (deviceResponseJson: string) => void;
  onError?: (error: unknown) => void;
  onSkip?: () => void;
};

const Register = ({ authToken, onSkip, onSuccess, onError }: RegisterProps) => {
  const { t } = useTranslation('components.passkeys.register');
  const registerMutation = useRegisterPasskeys();
  const skipMutation = useSkipPasskeys();
  const analytics = useAnalytics();
  const isSupported = Passkey.isSupported();

  const handleRegister = () => {
    analytics.track(Events.PasskeysRegistrationStarted);
    registerMutation.mutate(authToken, {
      onSuccess: deviceResponseJson => {
        analytics.track(Events.PasskeyRegistrationSucceeded);
        analytics.track(Events.FPasskeyCompleted, { result: 'success' });
        onSuccess(deviceResponseJson);
      },
      onError: (error: unknown) => {
        analytics.track(Events.PasskeyRegistrationFailed, {
          message: getErrorMessage(error),
        });
        onError(error);
      },
    });
  };

  const handleSkip = () => {
    analytics.track(Events.PasskeyRegistrationSkipped);
    analytics.track(Events.FPasskeyCompleted, { result: 'skip' });
    skipMutation.mutate({ authToken }, { onSuccess: onSkip });
  };

  const handleNotSupported = () => {
    analytics.track(Events.PasskeyRegistrationNotSupported);
    analytics.track(Events.FPasskeyCompleted, { result: 'not_supported' });
    skipMutation.mutate({ authToken }, { onSuccess: onSkip });
  };

  useEffect(() => {
    if (!isSupported) {
      handleNotSupported();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container center>
      <IcoFaceid40 />
      <Typography variant="heading-3" marginBottom={3} marginTop={4} center>
        {t('title')}
      </Typography>
      <Typography variant="body-3" marginBottom={9} center color="secondary">
        {t('subtitle')}
      </Typography>
      {registerMutation.isSuccess ? (
        <Success />
      ) : (
        <Box width="100%" gap={7}>
          <Button
            onPress={handleRegister}
            loading={registerMutation.isLoading}
            disabled={skipMutation.isLoading}
          >
            {t('cta')}
          </Button>
          <LinkButton
            onPress={handleSkip}
            disabled={skipMutation.isLoading || registerMutation.isLoading}
          >
            {t('skip')}
          </LinkButton>
        </Box>
      )}
    </Container>
  );
};

export default Register;
