import { Platform } from 'react-native';
import { getVersion as getAppVersion, getBuildNumber } from 'react-native-device-info';

const getPlatform = () => {
  if (Platform.OS === 'ios') {
    return 'appclip';
  }
  if (Platform.OS === 'android') {
    return 'instantapp';
  }
  return 'unknown';
};

const getVersion = () => {
  return `${getPlatform()}-${getAppVersion()}-${getBuildNumber()}`;
};

export default getVersion;
