import { IcoPasskey40 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import { Box, Button } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import {
  FPCustomEvents,
  sendCustomEvent,
} from '../../../../utils/custom-event';
import Logger from '../../../../utils/logger';
import LivenessSuccess from '../../components/liveness-success';
import useLivenessMachine from '../../hooks/use-liveness-machine';
import useBiometricInit from '../../hooks/use-register-biometric';

const SUCCESS_TRANSITION_DELAY_MS = 1500;

const Register = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'liveness.pages.register' });
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
        onSuccess({ deviceResponseJson }) {
          setTimeout(() => {
            sendCustomEvent(FPCustomEvents.receivedDeviceResponseJson, {
              deviceResponseJson,
            });
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
    <Container>
      <Box>
        <NavigationHeader />
        <Box marginBottom={3}>
          <IcoPasskey40 />
        </Box>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        {biometricInitMutation.isSuccess ? (
          <LivenessSuccess />
        ) : (
          <Box marginTop={7} width="100%">
            <Button
              loading={biometricInitMutation.isLoading}
              disabled={biometricInitMutation.isLoading}
              onClick={handleClick}
              fullWidth
              size="large"
            >
              {t('cta')}
            </Button>
          </Box>
        )}
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
