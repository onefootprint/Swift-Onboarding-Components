import {
  FpjsProvider,
  useVisitorData,
} from '@fingerprintjs/fingerprintjs-pro-react';
import React, { useEffect } from 'react';

import type { SDKIntegrationProps } from '../../device-signals.types';
import FINGERPRINT_API_KEY from './fingerprint.constants';
import useSendFingerprintPage from './hooks/use-send-fingerprint-page';

type FingerprintProps = SDKIntegrationProps;

const Fingerprint = ({ page, fpAuthToken }: FingerprintProps) => {
  if (!FINGERPRINT_API_KEY) {
    console.warn(
      'Fingerprint API key is not available. Skipping Fingerprint SDK initialization',
    );
    return null;
  }

  return (
    <FpjsProvider
      loadOptions={{
        apiKey: FINGERPRINT_API_KEY,
        endpoint: 'https://fp.risk.onefootprint.com',
      }}
    >
      <FingerprintIntegration page={page} fpAuthToken={fpAuthToken} />
    </FpjsProvider>
  );
};
const FingerprintIntegration = ({ page, fpAuthToken }: FingerprintProps) => {
  const sendFingerprintPageMutation = useSendFingerprintPage(fpAuthToken);
  const { data } = useVisitorData();

  useEffect(() => {
    if (data && data.visitorId && data.requestId && page) {
      sendFingerprintPageMutation.mutate({
        visitorId: data.visitorId,
        requestId: data.requestId,
        path: page,
      });
    }
  }, [data, page]);

  return null;
};

export default Fingerprint;
