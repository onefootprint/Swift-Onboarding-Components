import {
  FpjsProvider,
  useVisitorData,
} from '@fingerprintjs/fingerprintjs-pro-react';
import { useObserveCollector } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import type { SDKIntegrationProps } from '../../device-signals.types';
import FINGERPRINT_API_KEY from './fingerprint.constants';
import useSendFingerprintPage from './hooks/use-send-fingerprint-page';

type FingerprintProps = SDKIntegrationProps;

if (!FINGERPRINT_API_KEY) {
  console.warn(
    'Fingerprint API key is not available. Skipping Fingerprint SDK initialization',
  );
}

const Fingerprint = ({ page, fpAuthToken }: FingerprintProps) =>
  FINGERPRINT_API_KEY ? (
    <FpjsProvider
      loadOptions={{
        apiKey: FINGERPRINT_API_KEY,
        endpoint: 'https://fp.risk.onefootprint.com',
      }}
    >
      <FingerprintIntegration page={page} fpAuthToken={fpAuthToken} />
    </FpjsProvider>
  ) : null;

const FingerprintIntegration = ({ page, fpAuthToken }: FingerprintProps) => {
  const sendFingerprintPageMutation = useSendFingerprintPage(fpAuthToken);
  const { data, error } = useVisitorData();
  const observeCollector = useObserveCollector();

  useEffect(() => {
    if (data && data.visitorId && data.requestId && page) {
      sendFingerprintPageMutation.mutate({
        visitorId: data.visitorId,
        requestId: data.requestId,
        path: page,
      });
    }
  }, [data, page]);

  useEffect(() => {
    if (error) {
      observeCollector.logError('error', error, { isFingerprintError: true });
    }
  }, [error]);

  return null;
};

export default Fingerprint;
