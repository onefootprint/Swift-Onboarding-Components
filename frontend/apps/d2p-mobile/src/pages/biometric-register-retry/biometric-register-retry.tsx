import React, { useEffect } from 'react';
import HeaderTitle from 'src/components/header-title';
import useBiometricRegister from 'src/hooks/use-biometric-register';
import useD2pMobileMachine, { Events } from 'src/hooks/use-d2p-mobile-machine';
import useGetD2PStatus, { D2PStatus } from 'src/hooks/use-get-d2p-status';
import useUpdateD2pStatus, {
  D2PStatusUpdate,
} from 'src/hooks/use-update-d2p-status';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

const BiometricRegisterRetry = () => {
  const [state, send] = useD2pMobileMachine();
  const biometricRegisterMutation = useBiometricRegister();
  const updateD2PStatusMutation = useUpdateD2pStatus();
  const statusResponse = useGetD2PStatus();

  useEffect(() => {
    const status = statusResponse?.data?.status;
    if (status === D2PStatus.canceled) {
      send({ type: Events.biometricCanceled });
    } else if (status === D2PStatus.completed) {
      send({ type: Events.biometricRegisterSucceeded });
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
          send({ type: Events.biometricRegisterSucceeded });
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
      <Button onClick={handleBiometricRegister} fullWidth>
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

export default BiometricRegisterRetry;
