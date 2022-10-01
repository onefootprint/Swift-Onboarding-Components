import { useTranslation } from '@onefootprint/hooks';
import { D2PStatusUpdate } from '@onefootprint/types';
import { LinkButton, LoadingIndicator } from '@onefootprint/ui';
import { HeaderTitle } from 'footprint-elements';
import React, { useEffect } from 'react';
import useGetD2PStatus, {
  D2PStatus,
} from 'src/pages/liveness-check/hooks/d2p/use-get-d2p-status';
import useUpdateD2PStatus from 'src/pages/liveness-check/hooks/d2p/use-update-d2p-status';
import { Events } from 'src/utils/state-machine/liveness-check';
import styled, { css } from 'styled-components';

import { useLivenessCheckMachine } from '../../components/machine-provider';

const QRCodeSent = () => {
  const [state, send] = useLivenessCheckMachine();
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const statusResponse = useGetD2PStatus();
  const { t } = useTranslation('pages.liveness-check.qr-code-sent');

  const handleCancel = () => {
    const authToken = state.context.scopedAuthToken;
    if (!authToken) {
      return;
    }
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
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <LoadingIndicator />
      <LinkButton onClick={handleCancel}>{t('cancel')}</LinkButton>
    </Container>
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
