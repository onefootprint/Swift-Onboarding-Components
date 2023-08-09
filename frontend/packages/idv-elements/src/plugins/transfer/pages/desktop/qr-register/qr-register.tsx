import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { D2PGenerateResponse } from '@onefootprint/types';
import { Button, Divider, Shimmer, Typography } from '@onefootprint/ui';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';

import HeaderTitle from '../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../components/layout/components/navigation-header';
import { useD2PSms, useGetD2PStatus } from '../../../../../hooks';
import { useCreateHandoffUrl } from '../../../../../hooks/ui';
import useDesktopMachine from '../../../hooks/desktop/use-desktop-machine';
import useHandleD2PStatusUpdate from '../../../hooks/desktop/use-handle-d2p-status-update';
import useTranslationSourceForRequirements from '../../../hooks/desktop/use-translation-source-for-requirements';
import useGenerateScopedAuthToken from '../../../hooks/use-generate-scoped-auth-token';

const QRRegister = () => {
  const { t } = useTranslation('pages.desktop.qr-register');
  const translationSource = useTranslationSourceForRequirements();
  const [state, send] = useDesktopMachine();
  const { authToken, device, config, scopedAuthToken } = state.context;
  const url = useCreateHandoffUrl(scopedAuthToken, config?.isAppClipEnabled);

  const { mutation, generateScopedAuthToken } = useGenerateScopedAuthToken({
    authToken,
    device,
    config,
    onSuccess: (data: D2PGenerateResponse) => {
      send({
        type: 'scopedAuthTokenGenerated',
        payload: {
          scopedAuthToken: data.authToken,
        },
      });
    },
  });
  const isLoading = mutation.isLoading || !scopedAuthToken || !url;

  const { handleSuccess, handleError } = useHandleD2PStatusUpdate();
  useGetD2PStatus({
    authToken: scopedAuthToken ?? '',
    options: {
      onSuccess: handleSuccess,
      onError: () => {
        generateScopedAuthToken();
        handleError();
      },
    },
  });

  const d2pSmsMutation = useD2PSms();
  const handleSendLinkToPhone = () => {
    if (!scopedAuthToken || !url) {
      return;
    }

    d2pSmsMutation.mutate(
      { authToken: scopedAuthToken, url },
      {
        onSuccess() {
          send({ type: 'qrCodeLinkSentViaSms' });
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
    row-gap: ${theme.spacing[7]};
    text-align: center;
  `}
`;

export default QRRegister;
