import React, { useEffect } from 'react';
import HeaderTitle from 'src/components/header-title';
import NavigationHeader from 'src/components/navigation-header';
import useGetD2PStatus, { D2PStatus } from 'src/hooks/d2p/use-get-d2p-status';
import useUpdateD2PStatus, {
  D2PStatusUpdate,
} from 'src/hooks/d2p/use-update-d2p-status';
import { Events } from 'src/utils/state-machine/liveness-register';
import styled, { css } from 'styled-components';
import { LinkButton, LoadingIndicator } from 'ui';

import { useLivenessRegisterMachine } from '../../components/machine-provider';

const QRCodeSent = () => {
  const [state, send] = useLivenessRegisterMachine();
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const statusResponse = useGetD2PStatus();

  const handleCancel = () => {
    const authToken = state.context.scopedAuthToken;
    updateD2PStatusMutation.mutate(
      { authToken, status: D2PStatusUpdate.canceled },
      {
        onSuccess() {
          send({ type: Events.qrCodeCanceled });
        },
      },
    );
  };

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
    if (status === D2PStatus.completed) {
      send({
        type: Events.qrRegisterSucceeded,
      });
    }
    if (status === D2PStatus.failed) {
      send({ type: Events.qrRegisterFailed });
    }
    if (status === D2PStatus.canceled) {
      send({ type: Events.qrCodeCanceled });
    }
    if (status === D2PStatus.inProgress) {
      // If the user pressed "send link via sms", we already sent the Events.qrCodeSent and transitioned to another page
      // The only way to get this status while still on this page is if the user scanned the qr code
      send({
        type: Events.qrCodeScanned,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusResponse?.data?.status]);

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirm: true }} />
      <Container>
        <HeaderTitle
          title="Liveness check"
          subtitle="Link sent to phone. Please continue from there."
        />
        <LoadingIndicator />
        <LinkButton onClick={handleCancel}>Cancel</LinkButton>
      </Container>
    </>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    row-gap: ${theme.spacing[7]}px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  `}
`;

export default QRCodeSent;
