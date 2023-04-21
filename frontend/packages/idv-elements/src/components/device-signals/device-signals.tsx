import React from 'react';

import FingerprintIntegration from './components/fingerprint';
import SocureIntegration from './components/socure';
import type { Page } from './device-signals.types';

type DeviceSignalsProps = {
  children: React.ReactNode;
  fpAuthToken: string;
  page: Page;
};

const DeviceSignals = ({ children, fpAuthToken, page }: DeviceSignalsProps) => (
  <>
    <FingerprintIntegration page={page} fpAuthToken={fpAuthToken} />
    <SocureIntegration page={page} fpAuthToken={fpAuthToken} />
    {children}
  </>
);

export default DeviceSignals;
