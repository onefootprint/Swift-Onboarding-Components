import { useTranslation } from '@onefootprint/hooks';
import { Box, Button } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../components/header-title';
import LivenessSuccess from '../../components/liveness-success';
import useLivenessMachine, { Events } from '../../hooks/use-liveness-machine';
import useBiometricInit from '../../hooks/use-register-biometric';

const SUCCESS_TRANSITION_DELAY_MS = 1500;

const Register = () => {
  const { t } = useTranslation('pages.register');
  const [state, send] = useLivenessMachine();
  const { authToken } = state.context;
  const biometricInitMutation = useBiometricInit();

  const handleClick = () => {
    if (!authToken) {
      return;
    }

    biometricInitMutation.mutate(
      { authToken },
      {
        onSuccess() {
          setTimeout(() => {
            send({ type: Events.succeeded });
          }, SUCCESS_TRANSITION_DELAY_MS);
        },
        onError() {
          send({ type: Events.failed });
        },
      },
    );
  };

  return (
    <Box>
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
