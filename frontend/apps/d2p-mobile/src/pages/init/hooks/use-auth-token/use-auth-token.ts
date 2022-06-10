import { IS_BROWSER } from 'global-constants';
import { useEffect } from 'react';
import useD2PMobileMachine from 'src/hooks/use-d2p-mobile-machine';
import { Events } from 'src/utils/state-machine';

const useAuthToken = () => {
  const [, send] = useD2PMobileMachine();

  useEffect(() => {
    send({
      type: Events.authTokenIdentified,
      payload: {
        authToken: IS_BROWSER ? window.location.hash.slice(1) : '',
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useAuthToken;
