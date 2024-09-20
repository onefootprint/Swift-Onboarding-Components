'use client';

import { FootprintPublicEvent } from '@onefootprint/footprint-js';
import { type DeviceInfo, getLogger } from '@onefootprint/idv';
import type { DoneArgs } from '@onefootprint/idv/src/components/identify';
import { Identify, IdentifyVariant } from '@onefootprint/idv/src/components/identify';
import type { ObKeyHeader } from '@onefootprint/idv/src/components/identify/types';
import { CLIENT_PUBLIC_KEY_HEADER, ChallengeKind, type PublicOnboardingConfig } from '@onefootprint/types';
import { useCallback, useState } from 'react';
import type { AuthDataPropsWithToken } from '../../state';

import { useOnboardingValidate } from '@/src/queries';
import { getAuthBootstrapData } from '@/src/utils';

import React from 'react';
import { useFootprintProvider } from '../../../../provider-footprint';
import { PasskeyStepLoading } from '../../../client-loading';
import { useAuthIdentifyAppMachine } from '../../state';
import Validating from '../validating';

const IDENTIFY_COMPLETE_VISIBLE_TIME = 2000;
const voidObj: Record<string, never> = {};
const { logError, logTrack } = getLogger({ location: 'auth-identify-page' });

const getOnboardConfigurationKey = (key?: string): ObKeyHeader | undefined =>
  key ? { [CLIENT_PUBLIC_KEY_HEADER]: key } : undefined;

const IdentifyAuthPage = () => {
  const [state, send] = useAuthIdentifyAppMachine();
  const [screen, setScreen] = useState<'identify' | 'prePasskey' | 'completed'>('identify');
  /** After the init step, we expect the config, props and device to be available */
  const config = state.context.config as NonNullable<PublicOnboardingConfig>;
  const props = state.context.props as NonNullable<AuthDataPropsWithToken>;
  const device = state.context.device as NonNullable<DeviceInfo>;
  const { authToken: initialAuthToken, options = voidObj, publicKey } = props || voidObj;

  const mutOnboardingValidate = useOnboardingValidate();
  const fpProvider = useFootprintProvider();

  const handleIdentifyCompletion = useCallback((args: DoneArgs, isDoneEarly: boolean) => {
    mutOnboardingValidate.mutate(
      { authToken: args.authToken },
      {
        onError: (error: unknown) => {
          logError('Onboarding validation error', error);
        },
        onSuccess: ({ validationToken }) => {
          fpProvider.send(FootprintPublicEvent.completed, validationToken);
          logTrack(`Onboarding validation: ${validationToken.slice(0, Math.floor(validationToken.length / 3))}...`);

          if (isDoneEarly) {
            window.setTimeout(() => {
              send({ type: 'doneReceived' });
            }, IDENTIFY_COMPLETE_VISIBLE_TIME);
            return;
          }

          send({ type: 'identifyCompleted', payload: { authToken: args.authToken } });
        },
      },
    );
  }, []);

  if (screen === 'completed') {
    return <Validating />;
  }

  if (screen === 'prePasskey') {
    return <PasskeyStepLoading />;
  }

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
        setScreen(isPasskeyAlreadyRegistered ? 'completed' : 'prePasskey');
        handleIdentifyCompletion(args, !!isPasskeyAlreadyRegistered);
      }}
    />
  );
};

export default React.memo(IdentifyAuthPage);
