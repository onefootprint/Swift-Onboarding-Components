import { useTranslation } from '@onefootprint/hooks';
import type { D2PGenerateResponse } from '@onefootprint/types';
import { Grid } from '@onefootprint/ui';
import React from 'react';

import { useL10nContext } from '../../../../../components/l10n-provider';
import HeaderTitle from '../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../components/layout/components/navigation-header';
import { useCreateHandoffUrl, useGetD2PStatus } from '../../../../../hooks';
import SmsButtonWithCountdown from '../../../components/sms-button-with-countdown';
import useHandleD2PStatusUpdate from '../../../hooks/mobile/use-handle-d2p-status-update';
import useMobileMachine from '../../../hooks/mobile/use-mobile-machine';
import useGenerateScopedAuthToken from '../../../hooks/use-generate-scoped-auth-token';

const Sms = () => {
  const { t } = useTranslation('pages.mobile.sms');
  useHandleD2PStatusUpdate();
  const [state, send] = useMobileMachine();
  const { config, scopedAuthToken, authToken, device, idDocOutcome } =
    state.context;
  const l10n = useL10nContext();
  const url = useCreateHandoffUrl({
    authToken: scopedAuthToken,
    onboardingConfig: config,
  });

  const { generateScopedAuthToken } = useGenerateScopedAuthToken({
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
    <Grid.Container gap={7} textAlign="center">
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <SmsButtonWithCountdown authToken={scopedAuthToken} url={url} />
    </Grid.Container>
  );
};

export default Sms;
