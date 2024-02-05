import { IcoFaceid40 } from '@onefootprint/icons';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React from 'react';

import useRequestError from '@/hooks/use-request-error';
import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

import useRegisterPasskeys from '../../hooks/use-register-passkeys';
import useSkipPasskeys from '../../hooks/use-skip-passkeys';
import Success from '../success';

export type RetryProps = {
  authToken: string;
  onSuccess?: (deviceResponseJson: string) => void;
  onSkip?: () => void;
};

const Retry = ({ authToken, onSkip, onSuccess }: RetryProps) => {
  const { t } = useTranslation('components.passkeys.retry');
  const { getErrorMessage } = useRequestError();
  const registerBiometric = useRegisterPasskeys();
  const skipMutation = useSkipPasskeys();
  const analytics = useAnalytics();

  const handleSkip = () => {
    analytics.track(Events.PasskeyRegistrationSkipped);
    analytics.track(Events.FPasskeyCompleted, { result: 'skip' });
    skipMutation.mutate({ authToken }, { onSuccess: onSkip });
  };

  const handleRegister = () => {
    analytics.track(Events.PasskeysRegistrationRetried);
    registerBiometric.mutate(authToken, {
      onSuccess: deviceResponseJson => {
        analytics.track(Events.PasskeyRegistrationSucceeded);
        analytics.track(Events.FPasskeyCompleted, { result: 'success' });
        onSuccess?.(deviceResponseJson);
      },
      onError: (error: unknown) => {
        analytics.track(Events.PasskeyRegistrationRetriedFailed, {
          message: getErrorMessage(error),
        });
      },
    });
  };

  return (
    <Container center>
      <IcoFaceid40 />
      <Typography variant="heading-3" marginBottom={3} marginTop={4}>
        {t('title')}
      </Typography>
      <Typography variant="body-3" marginBottom={9} center>
        {t('subtitle')}
      </Typography>
      {registerBiometric.isSuccess ? (
        <Success />
      ) : (
        <Box gap={4} width="100%">
          <Button
            onPress={handleRegister}
            loading={registerBiometric.isLoading}
            disabled={skipMutation.isLoading}
          >
            {t('cta')}
          </Button>
          <Button
            loading={skipMutation.isLoading}
            disabled={registerBiometric.isLoading}
            onPress={handleSkip}
            variant="secondary"
          >
            {t('skip')}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Retry;
