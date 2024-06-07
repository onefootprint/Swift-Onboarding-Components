import UAParser from 'ua-parser-js';
import { useEffectOnce } from 'usehooks-ts';

export type BasicDeviceInfo = {
  type: string;
  osName: string;
  browser: string;
};

export type DeviceInfo = BasicDeviceInfo & {
  hasSupportForWebauthn: boolean;
};

// UAParser device type can have an undefined type, because
// it could get executed on the server side. We assign a default
// device, just to avoid to make a lot of ifs
const DEFAULT_DEVICE_TYPE = 'unknown';
const DEFAULT_OS_TYPE = 'unknown';
const DEFAULT_BROWSER_TYPE = 'unknown';

export const getBasicDevice = () => {
  // return device without webauthn status for clients that don't care
  const uaParser = new UAParser();
  const device = uaParser.getDevice();
  const os = uaParser.getOS();
  const browser = uaParser.getBrowser();
  const info: BasicDeviceInfo = {
    type: device.type || DEFAULT_DEVICE_TYPE,
    osName: os.name || DEFAULT_OS_TYPE,
    browser: browser.name || DEFAULT_BROWSER_TYPE,
  };
  return info;
};

export const checkDeviceInfo = async () => {
  let hasSupportForWebauthn = false;
  if (window.PublicKeyCredential) {
    hasSupportForWebauthn = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }
  const basicInfo = getBasicDevice();
  const info: DeviceInfo = {
    hasSupportForWebauthn,
    ...basicInfo,
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
