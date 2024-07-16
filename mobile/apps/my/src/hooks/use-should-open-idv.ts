import { DEBUG_HANDOFF_URL, IS_DEV, REVIEW_AUTH_TOKEN } from '@/config/constants';

import useURL from './use-url';

const useShouldOpenIdv = () => {
  const linkingUrl = useURL() || '';
  const debugUrl = IS_DEV ? DEBUG_HANDOFF_URL : undefined;
  const url = debugUrl || linkingUrl;
  const isPreview = url.endsWith(REVIEW_AUTH_TOKEN);
  const isDemo = url.includes('demo=true');
  const isDebug = url.includes('debug=true');
  const shouldOpen = url.includes('https://handoff');

  return { shouldOpen, linkingUrl, isPreview, isDemo, isDebug };
};

export default useShouldOpenIdv;
