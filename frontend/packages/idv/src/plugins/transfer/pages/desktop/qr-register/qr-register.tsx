import { IcoSmartphone224 } from '@onefootprint/icons';
import type { D2PGenerateResponse } from '@onefootprint/types';
import { Divider, Grid, Shimmer, Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';

import { HeaderTitle, NavigationHeader } from '../../../../../components';
import { useL10nContext } from '../../../../../components/l10n-provider';
import { useCreateHandoffUrl, useGetD2PStatus } from '../../../../../hooks';
import SmsButtonWithCountdown from '../../../components/sms-button-with-countdown';
import useDesktopMachine from '../../../hooks/desktop/use-desktop-machine';
import useHandleD2PStatusUpdate from '../../../hooks/desktop/use-handle-d2p-status-update';
import useGenerateScopedAuthToken from '../../../hooks/use-generate-scoped-auth-token';
import useRequirementsTitle from '../../../hooks/use-requirements-title-translation-key';
import ContinueOnDesktop from './components/continue-on-desktop';

const QR_CODE_SIZE = 130;

const QRRegister = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('idv');
  const [state, send] = useDesktopMachine();
  const {
    authToken,
    missingRequirements,
    device,
    config,
    scopedAuthToken,
    idDocOutcome,
  } = state.context;
  const l10n = useL10nContext();

  const url = useCreateHandoffUrl({
    authToken: scopedAuthToken,
    onboardingConfig: config,
    language,
  });

  const { mutation, generateScopedAuthToken } = useGenerateScopedAuthToken({
    authToken,
    device,
    config,
    idDocOutcome,
    l10n,
    onSuccess: (data: D2PGenerateResponse) => {
      send({
        type: 'scopedAuthTokenGenerated',
        payload: {
          scopedAuthToken: data.authToken,
        },
      });
    },
  });

  const isLoading = mutation.isLoading || !url || !scopedAuthToken;

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

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <Grid.Container gap={7} textAlign="center">
        <HeaderTitle
          title={useRequirementsTitle(missingRequirements)}
          subtitle={t('transfer.pages.desktop.qr-register.subtitle')}
          icon={IcoSmartphone224}
        />
        <SmsButtonWithCountdown authToken={scopedAuthToken} url={url} />
        <Divider variant="secondary" />
        <Stack direction="column" align="center" gap={5}>
          <Typography variant="body-2" color="secondary">
            {t('transfer.pages.desktop.qr-register.qr-code.instructions')}
          </Typography>
          {isLoading ? (
            <Shimmer
              sx={{ height: `${QR_CODE_SIZE}px`, width: `${QR_CODE_SIZE}px` }}
            />
          ) : (
            <QRCode size={QR_CODE_SIZE} value={url} />
          )}
        </Stack>
        <Divider variant="secondary" />
        <ContinueOnDesktop />
      </Grid.Container>
    </>
  );
};

export default QRRegister;
