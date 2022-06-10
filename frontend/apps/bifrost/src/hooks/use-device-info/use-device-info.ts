import { useEffect } from 'react';
import { Events } from 'src/utils/state-machine/bifrost';
import UAParser from 'ua-parser-js';

import useBifrostMachine from '../use-bifrost-machine';

// UAParser device type can have an undefined type, because
// it could get executed on the server side. We assign a default
// device, just to avoid to make a lot of ifs
const DEFAULT_DEVICE_TYPE = 'unknown';

const checkWebAuthnSupport = async () => {
  if (!window.PublicKeyCredential) {
    return false;
  }
  const hasSupport =
    await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  return hasSupport;
};

const useDeviceInfo = () => {
  const [, send] = useBifrostMachine();

  const checkDeviceSupportForWebAuthn = async () => {
    const uaParser = new UAParser();
    const device = uaParser.getDevice();
    const hasSupportForWebAuthn = await checkWebAuthnSupport();
    send({
      type: Events.deviceInfoIdentified,
      payload: {
        hasSupportForWebAuthn,
        type: device.type || DEFAULT_DEVICE_TYPE,
      },
    });
  };

  useEffect(() => {
    checkDeviceSupportForWebAuthn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useDeviceInfo;
