import { MY1FP_D2P_BASE_URL } from 'src/config/constants';

const createBiometricUrl = (scopedAuthToken: string, deviceType?: string) => {
  if (deviceType) {
    return `${MY1FP_D2P_BASE_URL}?opener=${deviceType}#${scopedAuthToken}`;
  }
  return `${MY1FP_D2P_BASE_URL}#${scopedAuthToken}`;
};

export default createBiometricUrl;
