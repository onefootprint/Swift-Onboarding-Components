'use client';

import useGetOnboardingConfig from '@/src/queries/use-get-onboarding-config';
import { isSdkUrlAllowed } from '@/src/utils';
import type { FootprintAuthDataProps } from '@onefootprint/footprint-js';
import { getLogger, isAuth, useDeviceInfo } from '@onefootprint/idv';
import Loading from '@onefootprint/idv/src/components/identify/components/loading';
import { useEffect, useState } from 'react';
import { useFootprintProvider } from '../../../../provider-footprint';
import useProps from '../../../../provider-footprint/hooks/use-props';
import { useAuthIdentifyAppMachine } from '../../state';

type AuthDataPropsWithToken = FootprintAuthDataProps & { authToken?: string };

const { logError, logInfo } = getLogger({ location: 'identify-app-layout' });

const Init = (): JSX.Element | null => {
  const fpProvider = useFootprintProvider();
  const [_state, send] = useAuthIdentifyAppMachine();
  const [authProps, setAuthProps] = useState<AuthDataPropsWithToken | undefined>(undefined);

  useDeviceInfo(
    device => {
      send({ type: 'deviceReceived', payload: device });
      logInfo(`Webauthn support:${device.hasSupportForWebauthn}`, device);
    },
    /** Device is not crucial for authentication flow */
    error => logError('Unable to collect device info', error),
  );

  useProps<AuthDataPropsWithToken>(setAuthProps, (error: unknown) => {
    logError('Error fetching auth sdk args', error);
    send({ type: 'invalidConfigReceived' });
  });

  const onboardingConfig = useGetOnboardingConfig(authProps?.publicKey || '');

  useEffect(() => {
    if (!authProps || onboardingConfig.isLoading || !onboardingConfig.data) {
      return;
    }

    send({
      type: 'authPropsReceived',
      payload: {
        props: authProps,
        config: onboardingConfig.data,
      },
    });

    if (!isAuth(onboardingConfig.data?.kind)) {
      logError(`Invalid auth kind, ${onboardingConfig.data?.kind}`);
      send({ type: 'invalidAuthConfigReceived' });
    } else if (!isSdkUrlAllowed(fpProvider, onboardingConfig.data?.allowedOrigins)) {
      logError(`SDK URL not allowed, ${onboardingConfig.data?.allowedOrigins?.join(', ')}`);
      send({ type: 'sdkUrlNotAllowedReceived' });
    }
  }, [onboardingConfig, authProps]); // eslint-disable-line react-hooks/exhaustive-deps

  return <Loading />;
};

export default Init;
