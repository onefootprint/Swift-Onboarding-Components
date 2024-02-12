'use client';

import {
  type FootprintAuthDataProps,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import { Logger } from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useConfirmationDialog } from '@onefootprint/ui';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useOnboardingValidate } from '@/src/queries';
import { isAuth, isSdkUrlAllowed } from '@/src/utils';

import { useFootprintProvider } from '../../provider-footprint';
import useProps from '../../provider-footprint/hooks/use-props';
import type { DoneArgs, Variant } from '../../types';
import Identify from '../identify';
import Layout from '../layout';
import type { NotificationProps } from '../notification';
import Notification from '../notification';

type AuthDataPropsWithToken = FootprintAuthDataProps & { authToken?: string };

const voidObj: Record<string, never> = {};

const { canceled, closed, completed } = FootprintPublicEvent;

const onValidationTokenError = (error: unknown) => {
  console.error('Error while validating auth token', getErrorMessage(error));
};

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

  useProps<AuthDataPropsWithToken>(
    (authProps, authConfig) => {
      setProps(authProps);
      setConfig(authConfig);
      if (authConfig) {
        const { orgName, orgId, key } = authConfig;
        Logger.identify({ orgName, orgId, publicKey: key });
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

  if (!config) {
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
        publicKey={publicKey}
        authToken={authToken}
        config={config}
        userData={userData}
        showLogo={options.showLogo}
        onDone={handlers.complete}
      />
    </Layout>
  );
};

export default IdentifyApp;
