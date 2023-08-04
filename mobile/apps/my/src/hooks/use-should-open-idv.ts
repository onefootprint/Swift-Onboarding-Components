import { Platform } from 'react-native';

import useURL from './use-url';

const isAppClip = () => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  const { isClip } = require('react-native-app-clip');
  return isClip();
};

const useShouldOpenIdv = () => {
  const linkingUrl = useURL();
  const shouldOpen = isAppClip() || linkingUrl?.includes('https://handoff');
  return { shouldOpen, linkingUrl };
};

export default useShouldOpenIdv;
