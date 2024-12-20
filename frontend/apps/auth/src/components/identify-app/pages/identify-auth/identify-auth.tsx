'use client';

import type { DeviceInfo } from '@onefootprint/idv';
import { HeaderTitle, NavigationHeader, getRandomID, trackAction } from '@onefootprint/idv';
import { Identify, IdentifyVariant } from '@onefootprint/idv/src/components/identify';
import type { ObKeyHeader } from '@onefootprint/idv/src/components/identify/identify.types';
import { CLIENT_PUBLIC_KEY_HEADER, ChallengeKind, type PublicOnboardingConfig } from '@onefootprint/types';
import type { AuthDataPropsWithToken } from '../../state';

import { getAuthBootstrapData } from '@/src/utils';

import React, { useState } from 'react';

import TestIdInput from '@onefootprint/idv/src/pages/sandbox-outcome/components/test-id-input';
import { Button } from '@onefootprint/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuthIdentifyAppMachine } from '../../state';

const voidObj: Record<string, never> = {};

const getOnboardConfigurationKey = (key?: string): ObKeyHeader | undefined =>
  key ? { [CLIENT_PUBLIC_KEY_HEADER]: key } : undefined;

const IdentifyAuthPage = () => {
  const [state, send] = useAuthIdentifyAppMachine();
  /** After the init step, we expect the config, props and device to be available */
  const config = state.context.config as NonNullable<PublicOnboardingConfig>;
  const props = state.context.props as NonNullable<AuthDataPropsWithToken>;
  const device = state.context.device as NonNullable<DeviceInfo>;
  const { authToken: initialAuthToken, options = voidObj, publicKey } = props || voidObj;
  const [sandboxId, setSandboxId] = useState<string | undefined>();

  if (!config.isLive && !sandboxId) {
    // Collect sandbox ID before launching Identify flow
    return <CollectSandboxId onDone={({ testID }) => setSandboxId(testID)} />;
  }

  return (
    <Identify
      initArgs={{
        variant: IdentifyVariant.auth,
        device,
        obConfigAuth: getOnboardConfigurationKey(publicKey),
        initialAuthToken: initialAuthToken,
        config,
        isLive: !!config?.isLive,
        bootstrapData: getAuthBootstrapData(state.context.props || voidObj),
        sandboxId,
        logoConfig: options.showLogo
          ? {
              logoUrl: config?.logoUrl ?? undefined,
              orgName: config?.orgName,
            }
          : undefined,
      }}
      onDone={args => {
        const isPasskeyAlreadyRegistered = args.availableChallengeKinds?.includes(ChallengeKind.biometric);
        trackAction('auth:identify-completed');
        send({
          type: 'identifyCompleted',
          payload: { authToken: args.authToken, isPasskeyAlreadyRegistered: !!isPasskeyAlreadyRegistered },
        });
      }}
    />
  );
};

type CollectSandboxIdProps = {
  onDone: (formData: { testID: string }) => void;
};

const CollectSandboxId = ({ onDone }: CollectSandboxIdProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'global.pages.sandbox-outcome.test-id' });
  const form = useForm<{ testID: string }>({
    defaultValues: {
      testID: getRandomID(),
    },
    mode: 'onChange',
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onDone)}>
        <div className="flex flex-col">
          <NavigationHeader leftButton={{ variant: 'close' }} />
          <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
          <div className="mt-6 mb-6 p-5 border border-solid border-tertiary rounded">
            <TestIdInput />
          </div>
          <Button fullWidth type="submit" disabled={!!form.formState.errors?.testID} size="large">
            {t('continue')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default React.memo(IdentifyAuthPage);
