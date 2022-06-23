import { D2P_BASE_URL } from '../../config/constants';

const createBiometricUrl = (scopedAuthToken: string, deviceType?: string) => {
  if (deviceType) {
    return `${D2P_BASE_URL}?opener=${deviceType}#${scopedAuthToken}`;
  }
  return `${D2P_BASE_URL}#${scopedAuthToken}`;
};

export default createBiometricUrl;
