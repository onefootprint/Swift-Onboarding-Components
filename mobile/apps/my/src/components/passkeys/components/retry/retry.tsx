import { IcoFaceid40 } from '@onefootprint/icons';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

import useRegisterBiometric from '../../hooks/use-register-biometric';
import Success from '../success';
import useSkipPasskeys from './hooks/use-skip-passkeys';

export type RetryProps = {
  authToken: string;
  onSuccess?: (deviceResponseJson: string) => void;
  onSkip?: () => void;
};

const Retry = ({ authToken, onSkip, onSuccess }: RetryProps) => {
  const { t } = useTranslation('components.passkeys.retry');
  const registerBiometric = useRegisterBiometric();
  const mutation = useSkipPasskeys();
  const analytics = useAnalytics();

  const handleSkip = () => {
    analytics.track(Events.PasskeysRegistrationRetried);
    mutation.mutate(
      { authToken },
      {
        onSuccess: onSkip,
      },
    );
  };

  const handleRegister = () => {
    registerBiometric.mutate(authToken, {
      onSuccess,
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
            disabled={mutation.isLoading}
          >
            {t('cta')}
          </Button>
          <Button
            loading={mutation.isLoading}
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
