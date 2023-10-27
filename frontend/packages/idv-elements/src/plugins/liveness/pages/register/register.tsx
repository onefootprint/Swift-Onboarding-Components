import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { Box, Button } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import Logger from '../../../../utils/logger';
import LivenessSuccess from '../../components/liveness-success';
import useLivenessMachine from '../../hooks/use-liveness-machine';
import useBiometricInit from '../../hooks/use-register-biometric';

const SUCCESS_TRANSITION_DELAY_MS = 1500;

const Register = () => {
  const { t } = useTranslation('pages.register');
  const [state, send] = useLivenessMachine();
  const { authToken } = state.context;
  const biometricInitMutation = useBiometricInit();

  const handleClick = () => {
    if (!authToken || biometricInitMutation.isLoading) {
      return;
    }

    biometricInitMutation.mutate(
      { authToken },
      {
        onSuccess() {
          setTimeout(() => {
            send({ type: 'succeeded' });
          }, SUCCESS_TRANSITION_DELAY_MS);
        },
        onError(error: unknown) {
          Logger.error(
            `Failed to register passkeys for user: ${getErrorMessage(error)}`,
            'liveness-register',
          );
          send({ type: 'failed' });
        },
      },
    );
  };

  return (
    <Box>
      <NavigationHeader />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      {biometricInitMutation.isSuccess ? (
        <LivenessSuccess />
      ) : (
        <Button
          loading={biometricInitMutation.isLoading}
          disabled={biometricInitMutation.isLoading}
          onClick={handleClick}
          fullWidth
          sx={{ marginTop: 8 }}
        >
          {t('cta')}
        </Button>
      )}
    </Box>
  );
};

export default Register;
