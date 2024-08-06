import type { D2PGenerateResponse } from '@onefootprint/types';
import { Grid } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { useL10nContext } from '../../../../components/l10n-provider';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import { useGetD2PStatus } from '../../../../queries';
import SmsButtonWithCountdown from '../../components/sms-button-with-countdown';
import useCreateHandoffUrl from '../../hooks/use-create-handoff-url';
import useGenerateScopedAuthToken from '../../hooks/use-generate-scoped-auth-token';
import useHandleD2PStatusUpdate from '../../hooks/use-handle-d2p-status-update';
import useTransferMachine from '../../hooks/use-machine';

const Sms = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('idv', {
    keyPrefix: 'transfer.pages.sms',
  });
  useHandleD2PStatusUpdate();
  const [state, send] = useTransferMachine();
  const { config, scopedAuthToken, authToken, device, idDocOutcome, missingRequirements } = state.context;
  const l10n = useL10nContext();
  const url = useCreateHandoffUrl({
    authToken: scopedAuthToken,
    onboardingConfig: config,
    language,
    missingRequirements,
  });
  const urlStr = url?.toString();

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
      <SmsButtonWithCountdown authToken={scopedAuthToken} url={urlStr} />
    </Grid.Container>
  );
};

export default Sms;
