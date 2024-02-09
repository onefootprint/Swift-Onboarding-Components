import UAParser from 'ua-parser-js';
import { useEffectOnce } from 'usehooks-ts';

export type DeviceInfo = {
  hasSupportForWebauthn: boolean;
  type: string;
  osName: string;
};

// UAParser device type can have an undefined type, because
// it could get executed on the server side. We assign a default
// device, just to avoid to make a lot of ifs
const DEFAULT_DEVICE_TYPE = 'unknown';
const DEFAULT_OS_TYPE = 'unknown';

export const checkDeviceInfo = async () => {
  const uaParser = new UAParser();
  const device = uaParser.getDevice();
  const os = uaParser.getOS();
  let hasSupportForWebauthn = false;
  if (window.PublicKeyCredential) {
    hasSupportForWebauthn =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }
  const info: DeviceInfo = {
    hasSupportForWebauthn,
    type: device.type || DEFAULT_DEVICE_TYPE,
    osName: os.name || DEFAULT_OS_TYPE,
  };
  return info;
};

const useDeviceInfo = (onComplete: (deviceInfo: DeviceInfo) => void) => {
  useEffectOnce(() => {
    checkDeviceInfo().then(info => {
      onComplete(info);
    });
  });
};

export default useDeviceInfo;
