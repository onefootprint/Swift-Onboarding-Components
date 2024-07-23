import UAParser from 'ua-parser-js';
import { useEffectOnce } from 'usehooks-ts';
import { isFunction, isUndefined } from '../../../utils/type-guards';

export type BasicDeviceInfo = { browser: string; osName: string; type: string };
export type DeviceInfo = BasicDeviceInfo & {
  hasSupportForWebauthn: boolean;
  initialCameraPermissionState?: PermissionState;
};

// UAParser device type can have an undefined type, because
// it could get executed on the server side. We assign a default
// device, just to avoid to make a lot of ifs
const DEFAULT_DEVICE_TYPE = 'unknown';
const DEFAULT_OS_TYPE = 'unknown';
const DEFAULT_BROWSER_TYPE = 'unknown';

const getCameraPermissionState = async (): Promise<PermissionState> => {
  if (isUndefined(navigator)) return Promise.resolve('denied');
  if (isUndefined(navigator.permissions)) return Promise.resolve('denied');
  if (!isFunction(navigator.permissions.query)) return Promise.resolve('denied');

  try {
    const res = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return res.state;
  } catch (_err) {
    return 'denied';
  }
};

export const getBasicDevice = () => {
  // return device without webauthn status for clients that don't care
  const uaParser = new UAParser();
  const device = uaParser.getDevice();
  const os = uaParser.getOS();
  const browser = uaParser.getBrowser();
  const info: BasicDeviceInfo = {
    browser: browser.name || DEFAULT_BROWSER_TYPE,
    osName: os.name || DEFAULT_OS_TYPE,
    type: device.type || DEFAULT_DEVICE_TYPE,
  };
  return info;
};

export const checkDeviceInfo = async () => {
  let hasSupportForWebauthn = false;
  if (typeof window !== 'undefined' && window.PublicKeyCredential) {
    try {
      hasSupportForWebauthn = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      console.error('Error checking for WebAuthn support:', error);
    }
  }
  const basicInfo = getBasicDevice();
  return { hasSupportForWebauthn, ...basicInfo };
};

const useDeviceInfo = (onComplete: (deviceInfo: DeviceInfo) => void, onError?: () => void) => {
  useEffectOnce(() => {
    Promise.all([checkDeviceInfo(), getCameraPermissionState()])
      .then(([deviceInfo, initialCameraPermissionState]) => onComplete({ ...deviceInfo, initialCameraPermissionState }))
      .catch(onError);
  });
};

export default useDeviceInfo;
