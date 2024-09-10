'use client';

import { isSdkUrlAllowed } from '@/src/utils';
import type { FootprintAuthDataProps } from '@onefootprint/footprint-js';
import { getLogger, isAuth, useDeviceInfo } from '@onefootprint/idv';
import Loading from '@onefootprint/idv/src/components/identify/components/loading';
import { useFootprintProvider } from '../../../../provider-footprint';
import useProps from '../../../../provider-footprint/hooks/use-props';
import { useAuthIdentifyAppMachine } from '../../state';

type AuthDataPropsWithToken = FootprintAuthDataProps & { authToken?: string };

const { logError, logInfo } = getLogger({ location: 'identify-app-layout' });

const Init = (): JSX.Element | null => {
  const fpProvider = useFootprintProvider();
  const [_state, send] = useAuthIdentifyAppMachine();

  useDeviceInfo(
    device => {
      send({ type: 'deviceReceived', payload: device });
      logInfo(`Webauthn support:${device.hasSupportForWebauthn}`, device);
    },
    /** Device is not crucial for authentication flow */
    error => logError('Unable to collect device info', error),
  );

  useProps<AuthDataPropsWithToken>(
    (authProps, authConfig) => {
      send({
        type: 'authPropsReceived',
        payload: {
          props: authProps,
          config: authConfig,
        },
      });

      if (!isAuth(authConfig?.kind)) {
        logError(`Invalid auth kind, ${authConfig?.kind}`);
        send({ type: 'invalidAuthConfigReceived' });
      } else if (!isSdkUrlAllowed(fpProvider, authConfig?.allowedOrigins)) {
        logError(`SDK URL not allowed, ${authConfig?.allowedOrigins?.join(', ')}`);
        send({ type: 'sdkUrlNotAllowedReceived' });
      }
    },
    (error: unknown) => {
      logError('Error fetching auth sdk args', error);
      send({ type: 'invalidConfigReceived' });
    },
  );

  return <Loading />;
};

export default Init;
