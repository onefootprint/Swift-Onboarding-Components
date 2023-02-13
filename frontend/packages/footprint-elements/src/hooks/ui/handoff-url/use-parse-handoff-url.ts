import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useParseHandoffUrl = (options: {
  onSuccess?: (authToken: string) => void;
  onError?: () => void;
}) => {
  const router = useRouter();

  useEffect(() => {
    const parts = router.asPath.split('#');
    if (parts.length <= 1) {
      return;
    }
    try {
      const authToken = decodeURI(parts[1]);
      options.onSuccess?.(authToken);
    } catch {
      options.onError?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);
};

export default useParseHandoffUrl;
