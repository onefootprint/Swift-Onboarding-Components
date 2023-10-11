import { useCountdown, useTranslation } from '@onefootprint/hooks';
import { IcoSmartphone224 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { D2PGenerateResponse } from '@onefootprint/types';
import {
  Button,
  Divider,
  Shimmer,
  Stack,
  Typography,
  useToast,
} from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useEffectOnce } from 'usehooks-ts';

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
import ContinueOnDesktop from './components/continue-on-desktop';

const COUNTER_SECONDS = 10;
const QR_CODE_SIZE = 130;

const QRRegister = () => {
  const { t } = useTranslation('pages.desktop.qr-register');
  const translationSource = useTranslationSourceForRequirements();
  const toast = useToast();

  const [state, send] = useDesktopMachine();
  const { authToken, device, config, scopedAuthToken, idDocOutcome } =
    state.context;
  const url = useCreateHandoffUrl({
    authToken: scopedAuthToken,
    onboardingConfig: config,
  });

  const [isDisabled, setIsDisabled] = useState(false);
  const { countdown, setSeconds } = useCountdown({
    onCompleted: () => setIsDisabled(false),
  });
  const disableAndCountdown = () => {
    setIsDisabled(true);
    setSeconds(COUNTER_SECONDS);
  };

  const d2pSmsMutation = useD2PSms();
  const handleSendLinkToPhone = () => {
    if (!scopedAuthToken || !url || d2pSmsMutation.isLoading) {
      return;
    }
    d2pSmsMutation.mutate(
      { authToken: scopedAuthToken, url },
      {
        onSuccess() {
          disableAndCountdown();
        },
        onError() {
          setIsDisabled(false);
          setSeconds(0);
          toast.show({
            title: t('sms.error.title'),
            description: t('sms.error.description'),
            variant: 'error',
          });
        },
      },
    );
  };

  useEffectOnce(() => {
    disableAndCountdown();
  });
  useEffect(() => {
    handleSendLinkToPhone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

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

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle
          title={t(`${translationSource}.title`)}
          subtitle={t('subtitle')}
          icon={IcoSmartphone224}
        />
        <Stack direction="column" align="center" gap={3}>
          <Button
            variant="secondary"
            fullWidth
            disabled={isDisabled}
            onClick={handleSendLinkToPhone}
            sx={{ marginTop: 2 }}
          >
            {t('sms.cta')}
          </Button>
          {isDisabled && (
            <Typography variant="body-4" color="quaternary">
              {t('sms.subtitleWithCount', {
                count: countdown,
              })}
            </Typography>
          )}
        </Stack>
        <Divider variant="secondary" />
        <Stack direction="column" align="center" gap={5}>
          <Typography variant="body-2" color="secondary">
            {t('qr-code.instructions')}
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
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
    text-align: center;
  `}
`;

export default QRRegister;
