import React from 'react';

import Stytch from './components/stytch';

type DeviceSignalsProps = {
  fpAuthToken: string;
};

const DeviceSignals = ({ fpAuthToken }: DeviceSignalsProps) => <Stytch fpAuthToken={fpAuthToken} />;

export default DeviceSignals;
