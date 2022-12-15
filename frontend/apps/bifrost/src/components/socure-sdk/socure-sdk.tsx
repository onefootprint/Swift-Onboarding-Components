import Script from 'next/script';
import React from 'react';
import { SOCURE_PUBLIC_KEY } from 'src/config/constants';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

import useSendDeviceSessionId from './hooks/use-send-device-session-id';
import type {
  SocureContext,
  SocureRequest,
  SocureResponse,
} from './socure-sdk.types';

type SocureSdkProps = {
  context?: SocureContext;
  userConsent?: boolean;
};

const SocureSdk = ({
  context = 'profile',
  userConsent = true,
}: SocureSdkProps) => {
  const [state] = useBifrostMachine();
  const sendDeviceIdMutation = useSendDeviceSessionId();

  // Socure adds the devicer object to the window object
  // https://developer.socure.com/docs/sdks/sigma-device/js-sdk/js-overview
  const getDevicer = () => {
    const { devicer } = window as any;
    return devicer;
  };

  const initializeSdk = (publicKey: string, authToken: string) => {
    const devicer = getDevicer();
    const options: SocureRequest = {
      publicKey,
      userConsent,
      context,
    };
    devicer.run(options, (response: SocureResponse) => {
      if (response.sessionId) {
        sendDeviceIdMutation.mutate({
          deviceSessionId: response.sessionId,
          authToken,
        });
      }
    });
  };

  const handleReady = () => {
    const { authToken } = state.context;
    if (SOCURE_PUBLIC_KEY && authToken) {
      initializeSdk(SOCURE_PUBLIC_KEY, authToken);
    } else {
      console.warn(
        'Socure public key or auth token is not available. Skipping Socure SDK initialization',
      );
    }
  };

  return (
    <Script src="https://js.dvnfo.com/devicer.min.js" onReady={handleReady} />
  );
};

export default SocureSdk;
