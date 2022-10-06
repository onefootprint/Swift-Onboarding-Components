import { useTranslation } from '@onefootprint/hooks';
import { D2PStatus, D2PStatusUpdate } from '@onefootprint/types';
import { LinkButton, LoadingIndicator } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../components/header-title';
import NavigationHeader from '../../../../components/navigation-header';
import { useD2PMachine } from '../../components/machine-provider';
import useGetD2PStatus from '../../hooks/use-get-d2p-status';
import useUpdateD2PStatus from '../../hooks/use-update-d2p-status';
import { Events } from '../../utils/state-machine/types';

const QRCodeScanned = () => {
  const [state, send] = useD2PMachine();
  const { missingRequirements } = state.context;
  const { t } = useTranslation('pages.qr-code-scanned');
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const statusResponse = useGetD2PStatus();

  const { liveness, idScan } = missingRequirements;
  let translationSource = '';
  if (liveness && idScan) {
    translationSource = 'liveness-with-id-scan';
  } else if (liveness) {
    translationSource = 'liveness';
  } else {
    translationSource = 'id-scan';
  }

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
        <HeaderTitle
          title={t(`${translationSource}.title`)}
          subtitle={t('subtitle')}
        />
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
