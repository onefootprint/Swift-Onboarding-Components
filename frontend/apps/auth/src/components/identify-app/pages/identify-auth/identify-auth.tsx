'use client';

import type { DeviceInfo } from '@onefootprint/idv';
import { trackAction } from '@onefootprint/idv';
import { Identify, IdentifyVariant } from '@onefootprint/idv/src/components/identify';
import type { ObKeyHeader } from '@onefootprint/idv/src/components/identify/types';
import { CLIENT_PUBLIC_KEY_HEADER, ChallengeKind, type PublicOnboardingConfig } from '@onefootprint/types';
import type { AuthDataPropsWithToken } from '../../state';

import { getAuthBootstrapData } from '@/src/utils';

import React from 'react';

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

  return (
    <Identify
      variant={IdentifyVariant.auth}
      device={device}
      obConfigAuth={getOnboardConfigurationKey(publicKey)}
      initialAuthToken={initialAuthToken}
      config={config}
      isLive={!!config?.isLive}
      bootstrapData={getAuthBootstrapData(state.context.props || voidObj)}
      logoConfig={
        options.showLogo
          ? {
              logoUrl: config?.logoUrl ?? undefined,
              orgName: config?.orgName,
            }
          : undefined
      }
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

export default React.memo(IdentifyAuthPage);
