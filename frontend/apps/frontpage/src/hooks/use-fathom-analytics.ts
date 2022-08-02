import * as Fathom from 'fathom-client';
import { useRouter } from 'next/router';
import { useEffectOnce } from 'react-use';

import { FATHOM_TRACKING_CODE } from '../config/constants';

const useFathomAnalytics = () => {
  const router = useRouter();

  const load = () => {
    if (FATHOM_TRACKING_CODE) {
      Fathom.load(FATHOM_TRACKING_CODE, {
        includedDomains: ['localhost:3003', 'onefootprint.com'],
      });
    }
  };

  const track = () => {
    if (FATHOM_TRACKING_CODE) {
      Fathom.trackPageview();
    }
  };

  useEffectOnce(() => {
    load();
    router.events.on('routeChangeComplete', track);
    return () => {
      router.events.off('routeChangeComplete', track);
    };
  });
};

export default useFathomAnalytics;
