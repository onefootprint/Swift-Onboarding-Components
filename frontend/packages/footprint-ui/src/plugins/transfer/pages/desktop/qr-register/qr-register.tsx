import { useTranslation } from '@onefootprint/hooks';
import { Button, Divider, Shimmer, Typography } from '@onefootprint/ui';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../components/header-title';
import NavigationHeader from '../../../../../components/navigation-header';
import { useD2PSms, useGetD2PStatus } from '../../../../../hooks';
import { createHandoffUrl } from '../../../../../utils/handoff-url';
import useDesktopMachine, {
  Events,
} from '../../../hooks/desktop/use-desktop-machine';
import useGenerateScopedAuthToken from '../../../hooks/desktop/use-generate-scoped-auth-token';
import useHandleD2PStatusUpdate from '../../../hooks/desktop/use-handle-d2p-status-update';
import useTranslationSourceForRequirements from '../../../hooks/desktop/use-translation-source-for-requirements';

const QRRegister = () => {
  const { t } = useTranslation('pages.desktop.qr-register');
  const translationSource = useTranslationSourceForRequirements();
  const [state, send] = useDesktopMachine();
  const { authToken, scopedAuthToken, tenant, device } = state.context;

  const { mutation, generateScopedAuthToken } = useGenerateScopedAuthToken();
  useEffect(() => {
    if (authToken) {
      generateScopedAuthToken(authToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const { handleSuccess, handleError } = useHandleD2PStatusUpdate();
  useGetD2PStatus(true, scopedAuthToken ?? '', {
    onSuccess: handleSuccess,
    onError: () => {
      if (authToken) {
        generateScopedAuthToken(authToken);
      }
      handleError();
    },
  });

  const url = createHandoffUrl({
    authToken: scopedAuthToken ?? '',
    tenantPk: tenant?.pk,
    opener: device?.type,
  });

  const d2pSmsMutation = useD2PSms();
  const handleSendLinkToPhone = () => {
    if (!scopedAuthToken) {
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
          {mutation.isLoading || !scopedAuthToken ? (
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
          disabled={mutation.isLoading}
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
