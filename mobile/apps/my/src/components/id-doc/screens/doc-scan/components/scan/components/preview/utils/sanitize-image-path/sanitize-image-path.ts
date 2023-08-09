import { Platform } from 'react-native';

const sanitizeImagePath = (path: string): string => {
  if (Platform.OS === 'android' && !path.includes('file://')) {
    return `file://${path}`;
  }

  return path;
};

export default sanitizeImagePath;
