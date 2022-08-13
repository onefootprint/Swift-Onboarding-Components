import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useBiometricMachine from 'src/hooks/use-d2p-mobile-machine';
import { Events } from 'src/utils/state-machine';

const useAuthToken = () => {
  const [, send] = useBiometricMachine();
  const router = useRouter();

  useEffect(() => {
    const authToken = router.asPath.split('#')[1];
    if (authToken) {
      send({
        type: Events.authTokenReceived,
        payload: {
          authToken,
        },
      });
    }
  }, [send, router.asPath]);
};

export default useAuthToken;
