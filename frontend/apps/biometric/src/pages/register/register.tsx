import { D2PStatusUpdate } from '@onefootprint/types';
import { useTranslation } from 'hooks';
import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

import HeaderTitle from '../../components/header-title';
import useBiometricMachine, {
  Events,
} from '../../hooks/use-d2p-mobile-machine';
import useGetD2PStatus, { D2PStatus } from '../../hooks/use-get-d2p-status';
import useBiometricRegister from '../../hooks/use-register';
import useUpdateD2pStatus from '../../hooks/use-update-d2p-status';

const Register = () => {
  const { t } = useTranslation('pages.register');
  const [state, send] = useBiometricMachine();
  const biometricRegisterMutation = useBiometricRegister();
  const updateD2PStatusMutation = useUpdateD2pStatus();
  const statusResponse = useGetD2PStatus();

  useEffect(() => {
    updateD2PStatusMutation.mutate({
      authToken: state.context.authToken,
      status: D2PStatusUpdate.inProgress,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (statusResponse.error) {
      send({
        type: Events.statusPollingErrored,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusResponse.error]);

  useEffect(() => {
    const status = statusResponse?.data?.status;
    if (status === D2PStatus.canceled) {
      send({ type: Events.canceled });
    } else if (status === D2PStatus.completed) {
      send({ type: Events.registerSucceeded });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusResponse?.data?.status]);

  const handleBiometricRegister = () => {
    const { authToken } = state.context;
    if (!authToken) {
      return;
    }
    biometricRegisterMutation.mutate(
      { authToken },
      {
        onSuccess() {
          updateD2PStatusMutation.mutate({
            authToken: state.context.authToken,
            status: D2PStatusUpdate.completed,
          });
          send({ type: Events.registerSucceeded });
        },
        onError() {
          send({ type: Events.registerFailed });
        },
      },
    );
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Button onClick={handleBiometricRegister} fullWidth>
        {t('cta')}
      </Button>
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[8]}px;
  `}
`;

export default Register;
