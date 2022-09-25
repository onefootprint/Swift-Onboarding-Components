import { useTranslation } from '@onefootprint/hooks';
import { D2PStatusUpdate } from '@onefootprint/types';
import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';
import { LinkButton, LoadingIndicator } from 'ui';

import HeaderTitle from '../../../../components/header-title';
import NavigationHeader from '../../../../components/navigation-header';
import useGetD2PStatus, { D2PStatus } from '../../hooks/use-get-d2p-status';
import useUpdateD2PStatus from '../../hooks/use-update-d2p-status';
import useWebAuthnMachine from '../../hooks/use-web-authn-machine';
import { Events } from '../../utils/machine';

const QRCodeScanned = () => {
  const [state, send] = useWebAuthnMachine();
  const { t } = useTranslation('pages.qr-code-scanned');
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
    const status = statusResponse?.data?.status;
    if (status === D2PStatus.completed) {
      send({
        type: Events.qrRegisterSucceeded,
      });
    } else if (status === D2PStatus.canceled || status === D2PStatus.failed) {
      send({ type: Events.qrRegisterFailed });
    } else if (status === D2PStatus.inProgress) {
      // If the user pressed "send link via sms", we already sent the Events.qrCodeSent and transitioned to another page
      // The only way to get this status while still on this page is if the user scanned the qr code
      send({
        type: Events.qrCodeScanned,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusResponse?.data?.status]);

  useEffect(() => {
    if (statusResponse.error) {
      send({
        type: Events.statusPollingErrored,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusResponse.error]);

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <LoadingIndicator />
        <LinkButton onClick={handleCancel}>{t('cancel')}</LinkButton>
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

export default QRCodeScanned;
