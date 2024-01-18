'use client';

import {
  FootprintComponentKind,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import { useTranslation } from '@onefootprint/hooks';
import type { DeviceInfo } from '@onefootprint/idv';
import {
  getIdentifyBootstrapData,
  getRandomID,
  Logger,
  useDeviceInfo,
} from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import { useConfirmationDialog } from '@onefootprint/ui';
import React, { useMemo, useRef, useState } from 'react';

import { useOnboardingValidate } from '@/src/queries';
import { AuthMachineProvider } from '@/src/state';
import type {
  DoneArgs,
  FootprintAuthDataProps,
  ObKeyHeader,
  Variant,
} from '@/src/types';
import { isSdkUrlAllowed, sandboxIdEditRules } from '@/src/utils';

import { useFootprintProvider } from '../../provider-footprint';
import useProps from '../../provider-footprint/hooks/use-props';
import AuthRouter from '../auth-router';
import DashedLine from '../dashed-line';
import Layout from '../layout';
import type { NotificationProps } from '../notification';
import Notification from '../notification';
import SandboxInput from '../sandbox-input';
import SandboxOutcomeFooter from '../sandbox-outcome-footer';

type AuthDataPropsWithToken = FootprintAuthDataProps & { authToken?: string };
type AuthContainerProps = { fallback: JSX.Element; variant?: Variant | null };

const voidObj: Record<string, never> = {};
const initialDevice = { hasSupportForWebauthn: false, type: 'unknown' };
const { canceled, closed, completed } = FootprintPublicEvent;

const RenderNull = (): null => null;
const isAuth = (x: unknown) => x === FootprintComponentKind.Auth;

const getOnboardConfigurationKey = (key?: string): ObKeyHeader | undefined =>
  key ? { [CLIENT_PUBLIC_KEY_HEADER]: key } : undefined;

const onValidationTokenError = (error: unknown) => {
  console.error('Error while validating auth token', getErrorMessage(error));
};

const AuthContainer = ({
  variant: paramVariant,
  fallback,
}: AuthContainerProps): JSX.Element | null => {
  const isDoneRef = useRef(false);
  const [props, setProps] = useState<AuthDataPropsWithToken>();
  const [config, setConfig] = useState<PublicOnboardingConfig | undefined>();
  const [device, setDevice] = useState<DeviceInfo>(initialDevice);
  const [sandboxId, setSandboxId] = useState<string>(() => getRandomID(13));
  const [notification, setNotification] = useState<
    NotificationProps | undefined
  >();

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

  const {
    authToken,
    options = voidObj,
    publicKey,
    userData,
    variant,
  } = props || voidObj;
  const fpProvider = useFootprintProvider();

  const { t } = useTranslation('auth');
  const confirmationDialog = useConfirmationDialog();
  const mutOnboardingValidate = useOnboardingValidate();
  const obConfigAuth = getOnboardConfigurationKey(publicKey);
  const isSandbox = !config?.isLive;

  useDeviceInfo(setDevice);

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

  const isSandboxEditable = useMemo(
    () => sandboxIdEditRules(userData || voidObj),
    [userData],
  );

  if (isDoneRef.current) return null;

  if (notification) {
    return (
      <Layout
        config={config}
        isSandbox={isSandbox}
        onClose={handlers.confirmCloseAndCancel}
        variant={paramVariant || variant}
      >
        <Notification
          subtitle={notification.subtitle}
          title={notification.title}
        />
      </Layout>
    );
  }

  return config ? (
    <Layout
      config={config}
      isSandbox={isSandbox}
      onClose={handlers.confirmCloseAndCancel}
      variant={paramVariant || variant}
    >
      <AuthMachineProvider
        args={{
          authToken,
          bootstrapData: getIdentifyBootstrapData(userData),
          config,
          device,
          obConfigAuth,
          sandboxId,
          showLogo: options.showLogo,
        }}
      >
        <AuthRouter onDone={handlers.complete}>
          {isSandbox
            ? (state, send) =>
                isSandboxEditable(state) ? (
                  <>
                    <DashedLine variant="secondary" />
                    <SandboxInput
                      label={t('sandbox.label')}
                      placeholder={t('sandbox.placeholder')}
                      value={sandboxId}
                      setValue={value => {
                        setSandboxId(value);
                        send({
                          type: 'sandboxIdChanged',
                          payload: { sandboxId: value },
                        });
                      }}
                      texts={{
                        copy: t('sandbox.button.copy'),
                        copyConfirmation: t('sandbox.button.copy-confirmation'),
                        description: t('sandbox.description'),
                        edit: t('sandbox.button.edit'),
                        reset: t('sandbox.button.reset'),
                        save: t('sandbox.button.save'),
                      }}
                    />
                  </>
                ) : (
                  <SandboxOutcomeFooter
                    label={t('sandbox.label')}
                    sandboxId={sandboxId}
                  />
                )
            : RenderNull}
        </AuthRouter>
      </AuthMachineProvider>
    </Layout>
  ) : (
    fallback
  );
};

export default AuthContainer;
