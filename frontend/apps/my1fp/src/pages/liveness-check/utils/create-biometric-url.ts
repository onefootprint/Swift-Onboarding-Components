import { BIOMETRIC_BASE_URL } from 'global-constants';

const createBiometricUrl = (scopedAuthToken: string, deviceType?: string) => {
  if (deviceType) {
    return `${BIOMETRIC_BASE_URL}?opener=${deviceType}#${scopedAuthToken}`;
  }
  return `${BIOMETRIC_BASE_URL}#${scopedAuthToken}`;
};

export default createBiometricUrl;
