import * as Linking from 'expo-linking';
import { isClip } from 'react-native-app-clip';

const useShouldOpenIdv = () => {
  const linkingUrl = Linking.useURL();
  const isAppClip = isClip();
  const shouldOpen = isAppClip || !!linkingUrl;
  return { shouldOpen, linkingUrl };
};

export default useShouldOpenIdv;
