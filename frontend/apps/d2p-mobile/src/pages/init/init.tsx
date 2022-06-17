import React from 'react';
import { LoadingIndicator } from 'ui';

import useAuthToken from '../../hooks/use-auth-token';
import useDeviceInfo from './hooks/use-device-info';

const Init = () => {
  useAuthToken();
  useDeviceInfo();
  return <LoadingIndicator />;
};

export default Init;
