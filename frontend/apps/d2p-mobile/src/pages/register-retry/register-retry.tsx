import React, { useEffect } from 'react';
import HeaderTitle from 'src/components/header-title';
import useD2pMobileMachine, { Events } from 'src/hooks/use-d2p-mobile-machine';
import useGetD2PStatus, { D2PStatus } from 'src/hooks/use-get-d2p-status';
import useRegister from 'src/hooks/use-register';
import useUpdateD2pStatus, {
  D2PStatusUpdate,
} from 'src/hooks/use-update-d2p-status';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

const RegisterRetry = () => {
  const [state, send] = useD2pMobileMachine();
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

  return (
    <Container>
      <HeaderTitle
        title="Biometrics not recognized"
        subtitle="Please try again."
      />
      <Button onClick={handleRegister} fullWidth>
        Try again
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
