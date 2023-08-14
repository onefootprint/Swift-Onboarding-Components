import { DEBUG_HANDOFF_URL, IS_DEV } from '@/domains/idv/config/constants';

import useURL from './use-url';

const useShouldOpenIdv = () => {
  const linkingUrl = useURL();
  if (DEBUG_HANDOFF_URL && IS_DEV) {
    return { shouldOpen: true, linkingUrl: DEBUG_HANDOFF_URL };
  }
  const shouldOpen = linkingUrl?.includes('https://handoff');
  return { shouldOpen, linkingUrl };
};

export default useShouldOpenIdv;
