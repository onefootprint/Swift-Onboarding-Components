import { IS_SERVER } from '@onefootprint/global-constants';
import Script from 'next/script';
import React from 'react';

import useTelemetryRequest from './hooks/use-send-telemetry';
import STYTCH_PUBLIC_TOKEN from './stytch.constants';

const IS_TEST = process.env.NODE_ENV === 'test';
const IS_E2E = process.env.IS_E2E === 'true';
const IS_CI = process.env.CI === 'true';
const IS_DISABLED = IS_SERVER || IS_TEST || IS_E2E || IS_CI;

export type StytchProps = {
  fpAuthToken: string;
};

const Stytch = ({ fpAuthToken }: StytchProps) => {
  const sendTelemetry = useTelemetryRequest(fpAuthToken);

  const getGetTelemetryID = () => {
    const { GetTelemetryID } = window as any;
    return GetTelemetryID;
  };

  const handleReady = () => {
    if (IS_DISABLED) {
      return;
    }

    const GetTelemetryID = getGetTelemetryID();
    if (!GetTelemetryID) {
      return;
    }

    if (STYTCH_PUBLIC_TOKEN) {
      GetTelemetryID(STYTCH_PUBLIC_TOKEN).then((telemetryId: string) => {
        sendTelemetry.mutate({ telemetryId });
      });
    } else {
      console.warn(
        'Stytch public token not available. Skipping sending Stytch telemetry',
      );
    }
  };

  return (
    <Script
      src="https://elements.stytch.com/telemetry.js"
      onReady={handleReady}
    />
  );
};

export default Stytch;
