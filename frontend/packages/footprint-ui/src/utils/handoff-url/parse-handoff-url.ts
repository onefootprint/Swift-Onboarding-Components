import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { HandoffUrlQuery } from './types';

const useParseHandoffUrl = (options: {
  onSuccess?: (query: HandoffUrlQuery) => void;
  onError?: () => void;
}) => {
  const router = useRouter();

  useEffect(() => {
    const parts = router.asPath.split('#');
    if (parts.length <= 1) {
      return;
    }
    try {
      const query = JSON.parse(decodeURI(parts[1])) as HandoffUrlQuery;
      options.onSuccess?.(query);
    } catch {
      options.onError?.();
    }
  }, [router.asPath]);
};

export default useParseHandoffUrl;
