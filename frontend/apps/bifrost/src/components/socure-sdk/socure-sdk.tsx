import Script from 'next/script';
import React from 'react';
import { SOCURE_PUBLIC_KEY } from 'src/config/constants';

import useSendDeviceId from './hooks/use-send-device-id';
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
  userConsent = false,
}: SocureSdkProps) => {
  const sendDeviceIdMutation = useSendDeviceId();

  // Socure adds the devicer object to the window object
  // https://developer.socure.com/docs/sdks/sigma-device/js-sdk/js-overview
  const getDevicer = () => {
    const { devicer } = window as any;
    return devicer;
  };

  const initializeSdk = (publicKey: string) => {
    const devicer = getDevicer();
    const options: SocureRequest = {
      publicKey,
      userConsent,
      context,
    };
    devicer.run(options, (response: SocureResponse) => {
      if (response.sessionId) {
        sendDeviceIdMutation.mutate(response.sessionId);
      }
    });
  };

  const handleLoad = () => {
    if (SOCURE_PUBLIC_KEY) {
      initializeSdk(SOCURE_PUBLIC_KEY);
    } else {
      console.warn(
        'SOCURE_PUBLIC_KEY is not set. Please set it in the environment variables.',
      );
    }
  };

  return (
    <Script src="https://js.dvnfo.com/devicer.min.js" onLoad={handleLoad} />
  );
};

export default SocureSdk;
