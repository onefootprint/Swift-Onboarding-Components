import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useD2PMobileMachine from 'src/hooks/use-d2p-mobile-machine';
import { Events } from 'src/utils/state-machine';

const useAuthToken = () => {
  const [, send] = useD2PMobileMachine();
  const router = useRouter();
  const authToken = router.asPath.split('#')[1];

  useEffect(() => {
    if (authToken) {
      send({
        type: Events.authTokenReceived,
        payload: {
          authToken,
        },
      });
    }
  }, [send, authToken]);
};

export default useAuthToken;
