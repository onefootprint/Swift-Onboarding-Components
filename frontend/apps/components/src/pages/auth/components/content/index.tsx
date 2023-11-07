import {
  FootprintComponentKind,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import { useTranslation } from '@onefootprint/hooks';
import type { DeviceInfo } from '@onefootprint/idv-elements';
import {
  getIdentifyBootstrapData,
  getRandomID,
  Identify,
  useDeviceInfo,
} from '@onefootprint/idv-elements';
import type { RequestError } from '@onefootprint/request';
import { getErrorMessage } from '@onefootprint/request';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import { useConfirmationDialog } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import React, { useMemo, useState } from 'react';

import { useFootprintProvider } from '../../../../components/footprint-provider';
import useProps from '../../../../components/footprint-provider/hooks/use-props';
import {
  useGetOnboardingConfigDuplicated,
  useOnboardingValidateDuplicated,
} from '../../hooks';
import type { FootprintAuthDataProps } from '../../types';
import Layout from '../layout';
import Notification from '../notification';

type IdentifyProps = ComponentProps<typeof Identify>;
type CompleteArgs = Parameters<IdentifyProps['onDone']>[0];
type ObKeyHeader = { 'X-Onboarding-Config-Key': string };

const voidObj: Record<string, never> = {};
const initialDevice = { hasSupportForWebauthn: false, type: 'unknown' };

const onOnboardingConfigError = (error: RequestError) => {
  const base = 'Fetching onboarding config in auth init failed with error';
  console.error(`${base}: ${getErrorMessage(error)}`);
};

const onValidationTokenError = (error: unknown) => {
  console.error('Error while validating onboarding', getErrorMessage(error));
};

const getOnboardConfigurationKey = (key?: string): ObKeyHeader | undefined =>
  key ? { [CLIENT_PUBLIC_KEY_HEADER]: key } : undefined;

const Content = (): JSX.Element | null => {
  const props = useProps<FootprintAuthDataProps>();
  const { options = voidObj, userData, variant, publicKey } = props || voidObj;
  const footprintProvider = useFootprintProvider();
  const [device, setDevice] = useState<DeviceInfo>(initialDevice);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const { t } = useTranslation('pages.auth');
  const confirmationDialog = useConfirmationDialog();
  const onboardingValidateMutation = useOnboardingValidateDuplicated();
  const obConfigAuth = getOnboardConfigurationKey(publicKey);
  const obConfigQuery = useGetOnboardingConfigDuplicated(
    { obConfigAuth },
    { onError: onOnboardingConfigError },
  );

  const config = obConfigQuery.data;
  const isSandbox = !config?.isLive;

  useDeviceInfo(setDevice);

  const handlers = useMemo(
    () => ({
      complete: (args: CompleteArgs) => {
        onboardingValidateMutation.mutate(
          { authToken: args.authToken },
          {
            onError: onValidationTokenError,
            onSuccess: validationToken => {
              footprintProvider.send(
                FootprintPublicEvent.completed,
                validationToken,
              );
              footprintProvider.send(FootprintPublicEvent.closed);
            },
          },
        );
        setIsComplete(true);
      },
      confirmCloseAndCancel: () => {
        confirmationDialog.open({
          description: t('confirm-close-description'),
          title: t('confirm-close-title'),
          secondaryButton: { label: t('no') },
          primaryButton: {
            label: t('yes'),
            onClick: () => {
              footprintProvider.send(FootprintPublicEvent.closed);
              footprintProvider.send(FootprintPublicEvent.canceled);
            },
          },
        });
      },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return !config || isComplete ? null : (
    <Layout
      variant={variant}
      publicKey={publicKey}
      isSandbox={isSandbox}
      onClose={handlers.confirmCloseAndCancel}
    >
      {config?.kind === FootprintComponentKind.Auth ? (
        <Identify
          bootstrapData={getIdentifyBootstrapData(userData)}
          config={config}
          device={device}
          initialAuthToken={undefined}
          l10n={props?.l10n}
          obConfigAuth={obConfigAuth}
          onDone={handlers.complete}
          sandboxId={isSandbox ? getRandomID(13) : undefined}
          showLogo={options.showLogo}
        />
      ) : (
        <Notification
          title={t('invalid-kind-title')}
          subtitle={t('invalid-kind-description')}
        />
      )}
    </Layout>
  );
};

export default Content;
