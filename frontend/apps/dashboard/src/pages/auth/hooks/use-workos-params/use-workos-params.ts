import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useWorkosParams = (callbacks: {
  onError: (openedByInvite: boolean) => void;
  onCodeFound: (code: string) => void;
  onCodeNotFound: () => void;
}) => {
  const router = useRouter();
  const { onCodeFound, onCodeNotFound, onError } = callbacks;

  const getQueryValue = (queryKey: string) => {
    const value = router.query[queryKey];
    return Array.isArray(value) ? value[0] : value;
  };

  useEffect(() => {
    if (router.isReady) {
      const code = getQueryValue('code');
      const error = getQueryValue('error');
      const state = getQueryValue('state');

      if (code) {
        onCodeFound(code);
      }
      if (!code && !error && !state) {
        onCodeNotFound();
      }
      if (error) {
        onError(state === 'openedByInvite');
      }
    }
  }, [router.isReady]);
};

export default useWorkosParams;
