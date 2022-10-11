import { useRouter } from 'next/router';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';

const useAuthenticationFlow = () => {
  const [, send] = useBifrostMachine();
  const router = useRouter();
  const isAuthenticationFlow = router.isReady && !router.query.public_key;

  if (isAuthenticationFlow) {
    send({ type: Events.authenticationFlowStarted });
  }
};

export default useAuthenticationFlow;
