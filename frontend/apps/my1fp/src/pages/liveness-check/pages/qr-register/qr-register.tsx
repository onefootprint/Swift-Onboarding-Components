import {
  HeaderTitle,
  useCreateHandoffUrl,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { D2PStatus } from '@onefootprint/types';
import { Button, Divider, Shimmer, Typography } from '@onefootprint/ui';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect } from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import { Events } from 'src/utils/state-machine/liveness-check';
import styled, { css } from 'styled-components';

import { useLivenessCheckMachine } from '../../components/machine-provider';
import useGenerateScopedAuthToken from '../../hooks/d2p/use-generate-scoped-auth-token';
import useGetD2PStatus from '../../hooks/d2p/use-get-d2p-status';
import useD2PSms from './hooks/use-d2p-sms';
import useD2PGenerate from './hooks/use-generate-d2p';

const QRRegister = () => {
  const { t } = useTranslation('pages.liveness-check.qr-register');
  const [state, send] = useLivenessCheckMachine();
  const { scopedAuthToken } = state.context;
  const { session } = useSessionUser();
  const authToken = session?.authToken;

  const d2pGenerateMutation = useD2PGenerate();
  const d2pSmsMutation = useD2PSms();
  const statusResponse = useGetD2PStatus();
  const generateScopedAuthToken = useGenerateScopedAuthToken();
  const url = useCreateHandoffUrl(scopedAuthToken);
  const isLoading = d2pGenerateMutation.isLoading || !scopedAuthToken || !url;

  useEffect(() => {
    if (!scopedAuthToken && authToken) {
      generateScopedAuthToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authToken && statusResponse.error) {
      generateScopedAuthToken();
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
    if (!scopedAuthToken || !url) {
      return;
    }
    d2pSmsMutation.mutate(
      { authToken: scopedAuthToken, url },
      {
        onSuccess() {
          send({ type: Events.qrCodeLinkSentViaSms });
        },
      },
    );
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Typography variant="body-2" color="secondary">
        {t('instructions')}
      </Typography>
      <QRCodeContainer>
        {isLoading ? (
          <Shimmer sx={{ height: '128px', width: '128px' }} />
        ) : (
          <QRCodeSVG value={url} />
        )}
      </QRCodeContainer>
      <Typography variant="body-4" color="tertiary">
        {t('qr-code.instructions')}
      </Typography>
      <Divider />
      <Typography variant="body-2" color="secondary">
        {t('sms.instructions')}
      </Typography>
      <Button fullWidth onClick={handleSendLinkToPhone} disabled={isLoading}>
        {t('sms.cta')}
      </Button>
    </Container>
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
    row-gap: ${theme.spacing[7]};
    text-align: center;
  `}
`;

export default QRRegister;
