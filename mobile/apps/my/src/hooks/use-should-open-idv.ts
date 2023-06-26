import * as Linking from 'expo-linking';
import { isClip } from 'react-native-app-clip';

const useShouldOpenIdv = () => {
  const linkingUrl = Linking.useURL();
  const isAppClip = isClip();
  return isAppClip || linkingUrl;
};

export default useShouldOpenIdv;
