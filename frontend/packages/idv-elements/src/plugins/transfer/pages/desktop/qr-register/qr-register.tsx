import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { D2PGenerateResponse } from '@onefootprint/types';
import {
  Button,
  Divider,
  LinkButton,
  Shimmer,
  Typography,
} from '@onefootprint/ui';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';

import HeaderTitle from '../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../components/layout/components/navigation-header';
import {
  useCreateHandoffUrl,
  useD2PSms,
  useGetD2PStatus,
} from '../../../../../hooks';
import useDesktopMachine from '../../../hooks/desktop/use-desktop-machine';
import useHandleD2PStatusUpdate from '../../../hooks/desktop/use-handle-d2p-status-update';
import useTranslationSourceForRequirements from '../../../hooks/desktop/use-translation-source-for-requirements';
import useGenerateScopedAuthToken from '../../../hooks/use-generate-scoped-auth-token';

const QRRegister = () => {
  const { t } = useTranslation('pages.desktop.qr-register');
  const translationSource = useTranslationSourceForRequirements();
  const [state, send] = useDesktopMachine();
  const {
    authToken,
    device,
    config,
    scopedAuthToken,
    idDocOutcome,
    missingRequirements: { idDoc },
  } = state.context;
  const url = useCreateHandoffUrl({
    authToken: scopedAuthToken,
    onboardingConfig: config,
  });

  const { mutation, generateScopedAuthToken } = useGenerateScopedAuthToken({
    authToken,
    device,
    config,
    idDocOutcome,
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
      onError: error => {
        generateScopedAuthToken();
        handleError(error);
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

  const handleContinueOnDesktop = () => {
    if (idDoc) {
      // If the missing requirements include ID doc, let's show a confirmation page
      send({
        type: 'confirmationRequired',
      });
      return;
    }

    send({
      type: 'continueOnDesktop',
    });
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
        <Divider variant="secondary" />
        <ContinueOnDesktop>
          <Typography variant="body-3" color="tertiary">
            {t('continue-on-desktop.title')}
          </Typography>
          <LinkButton
            onClick={handleContinueOnDesktop}
            size="compact"
            sx={{ height: '100%' }}
          >
            {t('continue-on-desktop.cta')}
          </LinkButton>
        </ContinueOnDesktop>
      </Container>
    </>
  );
};

const ContinueOnDesktop = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    width: 100%;
    gap: ${theme.spacing[3]};
    text-align: center;
  `}
`;

const QRCodeContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
    text-align: center;
  `}
`;

export default QRRegister;
