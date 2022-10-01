import { useTranslation } from '@onefootprint/hooks';
import { D2PStatusUpdate } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../components/header-title';
import useBiometricMachine, {
  Events,
} from '../../hooks/use-d2p-mobile-machine';
import useGetD2PStatus, { D2PStatus } from '../../hooks/use-get-d2p-status';
import useRegister from '../../hooks/use-register';
import useUpdateD2pStatus from '../../hooks/use-update-d2p-status';

const RegisterRetry = () => {
  const { t } = useTranslation('pages.register-retry');
  const [state, send] = useBiometricMachine();
  const registerMutation = useRegister();
  const updateD2PStatusMutation = useUpdateD2pStatus();
  const statusResponse = useGetD2PStatus();

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

  const handleRegister = () => {
    const { authToken } = state.context;
    if (!authToken) {
      return;
    }
    registerMutation.mutate(
      { authToken },
      {
        onSuccess() {
          updateD2PStatusMutation.mutate({
            authToken: state.context.authToken,
            status: D2PStatusUpdate.completed,
          });
          send({ type: Events.registerSucceeded });
        },
      },
    );
  };

  const handleSkip = () => {
    send({ type: Events.canceled });
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Button onClick={handleRegister} fullWidth>
        {t('cta')}
      </Button>
      <Button onClick={handleSkip} fullWidth>
        {t('skip')}
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

export default RegisterRetry;
