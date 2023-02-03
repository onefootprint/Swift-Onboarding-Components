import Script from 'next/script';
import React from 'react';

import type { SDKIntegrationProps } from '../../device-signals.types';
import useSendDeviceSessionId from './hooks/use-send-device-session-id';
import { SOCURE_ENDPOINT, SOCURE_PUBLIC_KEY } from './socure.constants';
import type { SocureRequest, SocureResponse } from './socure.types';
import getContextByPage from './utils/get-context-by-page';

type SocureProps = SDKIntegrationProps;

const Socure = ({ page, fpAuthToken }: SocureProps) => {
  const sendDeviceIdMutation = useSendDeviceSessionId(fpAuthToken);
  const context = getContextByPage(page);

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
      endpoint: SOCURE_ENDPOINT,
      userConsent: true,
      context,
    };
    devicer.run(options, (response: SocureResponse) => {
      if (response.sessionId) {
        sendDeviceIdMutation.mutate({
          deviceSessionId: response.sessionId,
        });
      }
    });
  };

  const handleReady = () => {
    if (SOCURE_PUBLIC_KEY) {
      initializeSdk(SOCURE_PUBLIC_KEY);
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

export default Socure;
