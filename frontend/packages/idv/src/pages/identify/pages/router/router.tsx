import { useLogStateMachine } from '@onefootprint/dev-tools';
import { useEffect } from 'react';

import useIdentifyMachine from '../../hooks/use-identify-machine';

export type DonePayload = {
  authToken: string;
  userFound: boolean;
  email?: string;
};

type RouterProps = {
  onDone: (payload: DonePayload) => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useIdentifyMachine();
  const isDone = state.matches('success');
  const {
    challenge: { authToken },
    identify: { userFound, email },
  } = state.context;
  useLogStateMachine('identify', state);

  useEffect(() => {
    if (!authToken) {
      // TODO: log event
      return;
    }
    if (isDone) {
      onDone({ authToken, userFound: !!userFound, email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, onDone]);

  // if (state.matches('initBootstrap')) {
  //   return <InitBootstrap />;
  // }
  // if (state.matches('bootstrapChallenge')) {
  //   return <BootstrapChallenge />;
  // }
  // if (state.matches('emailIdentification')) {
  //   return <EmailIdentification />;
  // }
  // if (state.matches('phoneIdentification')) {
  //   return <PhoneIdentification />;
  // }
  // if (state.matches('challenge')) {
  //   return <Challenge />;
  // }
  return null;
};

export default Router;
