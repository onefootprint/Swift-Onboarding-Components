import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import { Events } from 'src/utils/state-machine';

const useParseRouterPath = () => {
  const [, send] = useHandoffMachine();
  const router = useRouter();

  useEffect(() => {
    const urlParts = router.asPath.split('#');
    if (urlParts.length >= 3) {
      send({
        type: Events.paramsReceived,
        payload: {
          authToken: urlParts[1],
          tenantPk: urlParts[2],
        },
      });
    }
  }, [send, router.asPath]);
};

export default useParseRouterPath;
