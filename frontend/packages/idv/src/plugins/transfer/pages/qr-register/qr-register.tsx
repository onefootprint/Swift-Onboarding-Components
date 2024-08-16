import { IcoSmartphone40 } from '@onefootprint/icons';
import type { D2PGenerateResponse } from '@onefootprint/types';
import { Grid } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { HeaderTitle, NavigationHeader } from '../../../../components';
import { useL10nContext } from '../../../../components/l10n-provider';
import { useGetD2PStatus } from '../../../../queries';
import SmsButtonWithCountdown from '../../components/sms-button-with-countdown';
import useCreateHandoffUrl from '../../hooks/use-create-handoff-url';
import useGenerateScopedAuthToken from '../../hooks/use-generate-scoped-auth-token';
import useHandleD2PStatusUpdate from '../../hooks/use-handle-d2p-status-update';
import useTransferMachine from '../../hooks/use-machine';
import useRequirementsTitle from '../../hooks/use-requirements-title-translation-key';
import ContinueOnDesktop from './components/continue-on-desktop';
import QRSection from './components/qr-section';

const QRRegister = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('idv');
  const [state, send] = useTransferMachine();
  const { authToken, missingRequirements, isContinuingOnDesktop, device, config, scopedAuthToken, idDocOutcome } =
    state.context;
  const l10n = useL10nContext();
  const url = useCreateHandoffUrl({
    missingRequirements,
    authToken: scopedAuthToken,
    onboardingConfig: config,
    language,
  });
  const urlStr = url?.toString();

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

  const { title, linkSentToPhoneSubtitle } = useRequirementsTitle(missingRequirements, !!isContinuingOnDesktop);

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <Grid.Container textAlign="center">
        <Grid.Item paddingBottom={7} direction="column" gap={5}>
          <HeaderTitle
            title={title}
            subtitle={linkSentToPhoneSubtitle}
            icon={IcoSmartphone40}
            gap={5}
            display="flex"
            flexDirection="column"
          />
          <SmsButtonWithCountdown authToken={scopedAuthToken} url={urlStr} />
        </Grid.Item>
        <QRSection
          text={t('transfer.pages.qr-register.qr-code.instructions')}
          qrValue={url?.toString() ?? ''}
          isLoading={isLoading}
        />
        <ContinueOnDesktop />
      </Grid.Container>
    </>
  );
};

export default QRRegister;
