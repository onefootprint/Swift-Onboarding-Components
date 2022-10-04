import { useTranslation } from '@onefootprint/hooks';
import { Button, Divider, Shimmer, Typography } from '@onefootprint/ui';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../components/header-title';
import NavigationHeader from '../../../../components/navigation-header';
import { useD2PMachine } from '../../components/machine-provider';
import useD2PGenerate from '../../hooks/use-d2p-generate';
import useD2PSms from '../../hooks/use-d2p-sms';
import useGenerateScopedAuthToken from '../../hooks/use-generate-scoped-auth-token';
import useGetD2PStatus, { D2PStatus } from '../../hooks/use-get-d2p-status';
import createHandoffUrl from '../../utils/create-handoff-url';
import { Events } from '../../utils/state-machine/types';

const QRRegister = () => {
  const { t } = useTranslation('pages.qr-register');
  const [state, send] = useD2PMachine();
  const { authToken, scopedAuthToken, missingRequirements } = state.context;
  const d2pGenerateMutation = useD2PGenerate();
  const d2pSmsMutation = useD2PSms();
  const statusResponse = useGetD2PStatus();
  const generateScopedAuthToken = useGenerateScopedAuthToken();
  const shouldShowQRCodeLoading =
    d2pGenerateMutation.isLoading || !state.context.scopedAuthToken;

  const { liveness, idScan } = missingRequirements;
  let translationSource = '';
  if (liveness && idScan) {
    translationSource = 'liveness-with-id-scan';
  } else if (liveness) {
    translationSource = 'liveness';
  } else {
    translationSource = 'id-scan';
  }

  useEffect(() => {
    if (authToken) {
      generateScopedAuthToken(authToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  useEffect(() => {
    if (statusResponse.error && authToken) {
      generateScopedAuthToken(authToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusResponse.error]);

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

  const handleSendLinkToPhone = () => {
    if (!scopedAuthToken) {
      return;
    }
    d2pSmsMutation.mutate(
      { authToken: scopedAuthToken },
      {
        onSuccess() {
          send({ type: Events.qrCodeLinkSentViaSms });
        },
      },
    );
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle
          title={t(`${translationSource}.title`)}
          subtitle={t(`${translationSource}.subtitle`)}
        />
        <Typography variant="body-2" color="secondary">
          {t(`${translationSource}.instructions`)}
        </Typography>
        <QRCodeContainer>
          {shouldShowQRCodeLoading || !scopedAuthToken ? (
            <Shimmer sx={{ height: '128px', width: '128px' }} />
          ) : (
            <QRCodeSVG value={createHandoffUrl(scopedAuthToken)} />
          )}
        </QRCodeContainer>
        <Typography variant="body-4" color="tertiary">
          {t('qr-code.instructions')}
        </Typography>
        <Divider />
        <Typography variant="body-2" color="secondary">
          {t('sms.instructions')}
        </Typography>
        <Button
          fullWidth
          loading={d2pSmsMutation.isLoading}
          onClick={handleSendLinkToPhone}
        >
          {t('sms.cta')}
        </Button>
      </Container>
    </>
  );
};

const QRCodeContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
    text-align: center;
  `}
`;

export default QRRegister;
