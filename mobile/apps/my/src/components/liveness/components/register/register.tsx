import { IcoFaceid40 } from '@onefootprint/icons';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import useRegisterBiometric from '../../hooks/use-register-biometric';
import Success from '../success';
import About from './components/about';

export type RegisterProps = {
  authToken: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

const Register = ({ authToken, onSuccess, onError }: RegisterProps) => {
  const { t } = useTranslation('components.liveness.register');
  const registerBiometric = useRegisterBiometric();

  const handlePress = () => {
    registerBiometric.mutate(authToken, { onSuccess, onError });
  };

  return (
    <Container center>
      <IcoFaceid40 />
      <Typography variant="heading-3" marginBottom={3} marginTop={4} center>
        {t('title')}
      </Typography>
      <Typography variant="body-3" marginBottom={9} center color="secondary">
        {t('subtitle')}
      </Typography>
      {registerBiometric.isSuccess ? (
        <Success />
      ) : (
        <Box width="100%" gap={7}>
          <Button onPress={handlePress} loading={registerBiometric.isLoading}>
            {t('cta')}
          </Button>
          <About ctaDisabled={registerBiometric.isLoading} />
        </Box>
      )}
    </Container>
  );
};

export default Register;
