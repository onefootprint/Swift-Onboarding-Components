import * as Linking from 'expo-linking';

import { DEBUG_HANDOFF_URL, IS_DEV } from '@/domains/idv/config/constants';

const useIsDebug = () => {
  const linkingUrl = Linking.useURL();
  const debugUrl = IS_DEV ? DEBUG_HANDOFF_URL : undefined;
  const url = debugUrl || linkingUrl;

  let isDebug = false;

  if (url) {
    const urlObject = Linking.parse(url);
    if (urlObject.queryParams && urlObject.queryParams.debug === 'true') {
      isDebug = true;
    }
  }

  return isDebug;
};

export default useIsDebug;
