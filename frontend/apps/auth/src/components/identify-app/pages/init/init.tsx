'use client';

import useGetOnboardingConfig from '@/src/queries/use-get-onboarding-config';
import { isSdkUrlAllowed } from '@/src/utils';
import type { FootprintAuthDataProps } from '@onefootprint/footprint-js';
import type { DeviceInfo } from '@onefootprint/idv';
import { getLogger, isAuth, trackAction, useDeviceInfo } from '@onefootprint/idv';
import Loading from '@onefootprint/idv/src/components/identify/components/loading';
import { useEffect, useState } from 'react';
import { useFootprintProvider } from '../../../../provider-footprint';
import useProps from '../../../../provider-footprint/hooks/use-props';
import { useAuthIdentifyAppMachine } from '../../state';

type AuthDataPropsWithToken = FootprintAuthDataProps & { authToken?: string };

const { logError, logInfo, logWarn } = getLogger({ location: 'identify-app-layout' });

const Init = (): JSX.Element | null => {
  const fpProvider = useFootprintProvider();
  const [_state, send] = useAuthIdentifyAppMachine();
  const [device, setDevice] = useState<DeviceInfo | undefined>(undefined);
  const [authProps, setAuthProps] = useState<AuthDataPropsWithToken | undefined>(undefined);
  const onboardingConfig = useGetOnboardingConfig(authProps?.publicKey || '');

  useProps<AuthDataPropsWithToken>(setAuthProps, (error: unknown) => {
    logError('Error fetching auth sdk args', error);
    send({ type: 'invalidConfigReceived' });
  });

  useDeviceInfo(
    deviceInfo => {
      logInfo(`Webauthn support:${deviceInfo.hasSupportForWebauthn}`, device);
      setDevice(deviceInfo);
    },
    error => {
      logWarn('Unable to collect device info', error);
      setDevice({} as DeviceInfo);
    },
  );

  useEffect(() => {
    if (!device || !authProps || onboardingConfig.isLoading || !onboardingConfig.data) {
      return;
    }

    if (!isAuth(onboardingConfig.data?.kind)) {
      logError(`Invalid auth kind, ${onboardingConfig.data?.kind}`);
      send({ type: 'invalidAuthConfigReceived' });
    } else if (!isSdkUrlAllowed(fpProvider, onboardingConfig.data?.allowedOrigins)) {
      logError(`SDK URL not allowed, ${onboardingConfig.data?.allowedOrigins?.join(', ')}`);
      send({ type: 'sdkUrlNotAllowedReceived' });
    }

    trackAction('auth:started');
    send({
      type: 'initPropsReceived',
      payload: {
        config: onboardingConfig.data,
        device: device,
        props: authProps,
      },
    });
  }, [onboardingConfig, authProps]); // eslint-disable-line react-hooks/exhaustive-deps

  return <Loading />;
};

export default Init;
