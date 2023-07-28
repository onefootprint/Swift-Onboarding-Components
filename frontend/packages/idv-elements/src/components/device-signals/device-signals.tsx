import React from 'react';

import SocureIntegration from './components/socure';
import Stytch from './components/stytch';
import type { Page } from './device-signals.types';

type DeviceSignalsProps = {
  children: React.ReactNode;
  fpAuthToken: string;
  page: Page;
};

const DeviceSignals = ({ children, fpAuthToken, page }: DeviceSignalsProps) => (
  <>
    <SocureIntegration page={page} fpAuthToken={fpAuthToken} />
    <Stytch fpAuthToken={fpAuthToken} />
    {children}
  </>
);

export default DeviceSignals;
