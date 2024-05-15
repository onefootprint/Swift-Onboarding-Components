'use client';

import {
  type FootprintAuthDataProps,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import type { DeviceInfo } from '@onefootprint/idv';
import { isAuth, LoggerDeprecated, useDeviceInfo } from '@onefootprint/idv';
import type { DoneArgs } from '@onefootprint/idv/src/components/identify';
import {
  Identify,
  IdentifyVariant,
} from '@onefootprint/idv/src/components/identify';
import type { ObKeyHeader } from '@onefootprint/idv/src/components/identify/types';
import { getErrorMessage } from '@onefootprint/request';
import {
  CLIENT_PUBLIC_KEY_HEADER,
  type PublicOnboardingConfig,
} from '@onefootprint/types';
import { useConfirmationDialog } from '@onefootprint/ui';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useOnboardingValidate } from '@/src/queries';
import { isSdkUrlAllowed } from '@/src/utils';

import { useFootprintProvider } from '../../provider-footprint';
import useProps from '../../provider-footprint/hooks/use-props';
import type { Variant } from '../../types';
import Layout from '../client-layout';
import type { NotificationProps } from '../notification';
import Notification from '../notification';

type AuthDataPropsWithToken = FootprintAuthDataProps & { authToken?: string };

const voidObj: Record<string, never> = {};

const { canceled, closed, completed } = FootprintPublicEvent;

const onValidationTokenError = (error: unknown) => {
  console.error('Error while validating auth token', getErrorMessage(error));
};

const getOnboardConfigurationKey = (key?: string): ObKeyHeader | undefined =>
  key ? { [CLIENT_PUBLIC_KEY_HEADER]: key } : undefined;

type IdentifyAppProps = {
  variant?: Variant;
  fallback: JSX.Element;
};

const IdentifyApp = ({ variant: paramVariant, fallback }: IdentifyAppProps) => {
  const isDoneRef = useRef(false);
  const confirmationDialog = useConfirmationDialog();
  const mutOnboardingValidate = useOnboardingValidate();

  const [notification, setNotification] = useState<
    NotificationProps | undefined
  >();

  const [props, setProps] = useState<AuthDataPropsWithToken>();
  const [config, setConfig] = useState<PublicOnboardingConfig | undefined>();
  const { t } = useTranslation('common');
  const [device, setDevice] = useState<DeviceInfo>();
  useDeviceInfo(setDevice);

  useProps<AuthDataPropsWithToken>(
    (authProps, authConfig) => {
      setProps(authProps);
      setConfig(authConfig);
      if (authConfig) {
        const { orgName, orgId, key } = authConfig;
        LoggerDeprecated.identify({ orgName, orgId, publicKey: key });
      }

      if (notification) return;
      if (!isAuth(authConfig?.kind)) {
        setNotification({
          title: t('notification.invalid-kind-title'),
          subtitle: t('notification.invalid-kind-description'),
        });
      } else if (!isSdkUrlAllowed(fpProvider, authConfig?.allowedOrigins)) {
        setNotification({
          title: t('notification.invalid-domain-title'),
          subtitle: t('notification.invalid-domain-description'),
        });
      }
    },
    (error: unknown) => {
      const base = 'Fetching onboarding config in auth init failed with error';
      console.error(`${base}: ${getErrorMessage(error)}`);
      setNotification({
        title: t('notification.invalid-config-title'),
        subtitle: t('notification.invalid-config-subtitle'),
      });
    },
  );

  const handlers = useMemo(
    () => ({
      complete: (args: DoneArgs) => {
        isDoneRef.current = true;
        mutOnboardingValidate.mutate(
          { authToken: args.authToken },
          {
            onError: onValidationTokenError,
            onSuccess: validationToken => {
              fpProvider.send(completed, validationToken);
              fpProvider.send(closed);
            },
          },
        );
      },
      confirmCloseAndCancel: () => {
        isDoneRef.current = true;
        confirmationDialog.open({
          description: t('confirm-close-description'),
          title: t('confirm-close-title'),
          secondaryButton: { label: t('no') },
          primaryButton: {
            label: t('yes'),
            onClick: () => {
              fpProvider.send(closed);
              fpProvider.send(canceled);
            },
          },
        });
      },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const {
    authToken,
    options = voidObj,
    publicKey,
    userData,
  } = props || voidObj;
  const isSandbox = !config?.isLive;

  const fpProvider = useFootprintProvider();

  if (isDoneRef.current) return null;

  if (notification) {
    return (
      <Layout
        config={config}
        isSandbox={isSandbox}
        onClose={handlers.confirmCloseAndCancel}
        variant={paramVariant}
      >
        <Notification
          subtitle={notification.subtitle}
          title={notification.title}
        />
      </Layout>
    );
  }

  if (!config || !device) {
    return fallback;
  }

  return (
    <Layout
      config={config}
      isSandbox={isSandbox}
      onClose={handlers.confirmCloseAndCancel}
      variant={paramVariant}
    >
      <Identify
        variant={IdentifyVariant.auth}
        device={device}
        obConfigAuth={getOnboardConfigurationKey(publicKey)}
        initialAuthToken={authToken}
        config={config}
        isLive={config.isLive}
        bootstrapData={{
          email: userData?.['id.email'],
          phoneNumber: userData?.['id.phone_number'],
        }}
        logoConfig={
          options.showLogo
            ? {
                logoUrl: config.logoUrl ?? undefined,
                orgName: config.orgName,
              }
            : undefined
        }
        onDone={handlers.complete}
      />
    </Layout>
  );
};

export default IdentifyApp;
