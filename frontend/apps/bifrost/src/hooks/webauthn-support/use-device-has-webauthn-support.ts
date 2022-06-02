import { useEffect } from 'react';
import { Events } from 'src/bifrost-machine/types';
import UAParser from 'ua-parser-js';

import useBifrostMachine from '../bifrost-machine';

const checkWebAuthnSupport = async () => {
  const uaParser = new UAParser();
  const device = uaParser.getDevice();
  if (device.type !== 'mobile') {
    return false;
  }
  let hasSupport = false;
  if (window.PublicKeyCredential) {
    hasSupport =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }
  return hasSupport;
};

const useDeviceHasWebAuthnSupport = () => {
  const [, send] = useBifrostMachine();

  const checkDeviceSupportForWebAuthn = async () => {
    const hasSupport = await checkWebAuthnSupport();
    send({
      type: Events.deviceSupportForWebAuthnIdentified,
      payload: { hasSupport },
    });
  };

  useEffect(() => {
    checkDeviceSupportForWebAuthn();
  }, []);
};

export default useDeviceHasWebAuthnSupport;
