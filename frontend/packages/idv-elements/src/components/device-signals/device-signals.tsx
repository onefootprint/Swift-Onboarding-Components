import React from 'react';

import SocureIntegration from './components/socure';
import type { Page } from './device-signals.types';

type DeviceSignalsProps = {
  children: React.ReactNode;
  fpAuthToken: string;
  page: Page;
};

const DeviceSignals = ({ children, fpAuthToken, page }: DeviceSignalsProps) => (
  <>
    <SocureIntegration page={page} fpAuthToken={fpAuthToken} />
    {children}
  </>
);

export default DeviceSignals;
