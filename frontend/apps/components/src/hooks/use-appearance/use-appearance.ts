import { useRouter } from 'next/router';
import { useEffect } from 'react';

import applyAppearance from './utils/apply-appearance';
import parseAppearance from './utils/parse-appearance';

const useAppearance = () => {
  const router = useRouter();

  useEffect(() => {
    const appearance = parseAppearance(router.asPath, router.pathname);
    applyAppearance(appearance);
  }, [router.isReady, router.asPath, router.pathname]);
};

export default useAppearance;
