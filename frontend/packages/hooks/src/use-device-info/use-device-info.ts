import { useEffect } from 'react';
import UAParser from 'ua-parser-js';

import { DeviceInfo } from './use-device-info.types';

// UAParser device type can have an undefined type, because
// it could get executed on the server side. We assign a default
// device, just to avoid to make a lot of ifs
const DEFAULT_DEVICE_TYPE = 'unknown';

async function checkDeviceInfo() {
  const uaParser = new UAParser();
  const device = uaParser.getDevice();
  let hasSupportForWebauthn = false;
  if (window.PublicKeyCredential) {
    hasSupportForWebauthn =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }
  const info: DeviceInfo = {
    hasSupportForWebauthn,
    type: device.type || DEFAULT_DEVICE_TYPE,
  };
  return info;
}

const useDeviceInfo = (onComplete: (deviceInfo: DeviceInfo) => void) => {
  useEffect(() => {
    checkDeviceInfo().then(info => {
      onComplete(info);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useDeviceInfo;
