import { useEffect } from 'react';
import useD2PMobileMachine from 'src/hooks/use-d2p-mobile-machine';
import { Events } from 'src/utils/state-machine';
import UAParser from 'ua-parser-js';

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
  const [, send] = useD2PMobileMachine();

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
