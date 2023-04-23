import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useIdentifyMachine from '../../hooks/use-identify-machine';
import BootstrapChallenge from '../bootstrap-challenge';
import Challenge from '../challenge';
import EmailIdentification from '../email-identification';
import Init from '../init';
import InitBootstrap from '../init-bootstrap';
import PhoneIdentification from '../phone-identification';
import SandboxOutcome from '../sandbox-outcome';

export type DonePayload = {
  authToken: string;
  userFound: boolean;
  email?: string;
  sandboxSuffix?: string;
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

  if (state.matches('init')) {
    return <Init />;
  }
  if (state.matches('sandboxOutcome')) {
    return <SandboxOutcome />;
  }
  if (state.matches('initBootstrap')) {
    return <InitBootstrap />;
  }
  if (state.matches('bootstrapChallenge')) {
    return <BootstrapChallenge />;
  }
  if (state.matches('emailIdentification')) {
    return <EmailIdentification />;
  }
  if (state.matches('phoneIdentification')) {
    return <PhoneIdentification />;
  }
  if (state.matches('challenge')) {
    return <Challenge />;
  }
  return null;
};

export default Router;
