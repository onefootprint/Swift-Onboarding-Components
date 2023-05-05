import { IcoFaceid40 } from '@onefootprint/icons';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import useRegisterBiometric from '../../hooks/use-register-biometric';
import Success from '../success';
import useSkipLiveness from './hooks/use-skip-liveness';

export type RetryProps = {
  authToken: string;
  onSuccess?: () => void;
  onSkip?: () => void;
};

const Retry = ({ authToken, onSkip, onSuccess }: RetryProps) => {
  const { t } = useTranslation('components.liveness.retry');
  const registerBiometric = useRegisterBiometric();
  const skipLivenessMutation = useSkipLiveness();

  const handleSkip = () => {
    skipLivenessMutation.mutate(
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
            disabled={skipLivenessMutation.isLoading}
          >
            {t('cta')}
          </Button>
          <Button
            loading={skipLivenessMutation.isLoading}
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
