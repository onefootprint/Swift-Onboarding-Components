import { useRouter } from 'next/router';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';

const useAuthenticationFlow = () => {
  const [, send] = useBifrostMachine();
  const router = useRouter();
  const isAuthenticationFlow = router.query.flow === 'authentication';

  if (isAuthenticationFlow) {
    send({ type: Events.authenticationFlowStarted });
  }
};

export default useAuthenticationFlow;
