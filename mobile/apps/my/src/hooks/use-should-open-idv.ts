import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const isAppClip = () => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  const { isClip } = require('react-native-app-clip');
  return isClip();
};

const useShouldOpenIdv = () => {
  const linkingUrl = Linking.useURL();
  const shouldOpen = isAppClip() || linkingUrl?.includes('http://handoff');
  return { shouldOpen, linkingUrl };
};

export default useShouldOpenIdv;
