import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useAuthenticationFlow = (
  onComplete: (isAuthenticationFlow: boolean) => void,
) => {
  const router = useRouter();
  const isAuthenticationFlow = !router.query.public_key;

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    onComplete(isAuthenticationFlow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, isAuthenticationFlow]);
};

export default useAuthenticationFlow;
