import React, { useEffect } from 'react';

import type { MachineEvents } from '../../state';
import { useAuthMachine } from '../../state';
import type { DoneArgs } from '../../types';
import EmailChallenge from '../email-challenge';
import BaseLoading from '../loading/base-loading';
import PasskeyChallenge from '../passkey-challenge';
import StepBootstrap from '../step-bootstrap';
import StepEmail from '../step-email';
import StepPhone from '../step-phone';
import StepSms from '../step-sms';

type AuthRouteProps = {
  onDone: (payload: DoneArgs) => void;
  children?: (
    state: string,
    send: (event: MachineEvents) => void,
  ) => JSX.Element | null;
};

const AuthRouter = ({
  onDone,
  children,
}: AuthRouteProps): JSX.Element | null => {
  const [state, send] = useAuthMachine();
  const isDone = state.matches('success');
  const {
    challenge: { authToken },
  } = state.context;

  useEffect(() => {
    if (isDone && authToken) {
      onDone({ authToken });
    }
  }, [isDone, onDone]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isDone) return null;

  if (state.matches('init')) {
    return <BaseLoading>{children?.('init', send)}</BaseLoading>;
  }
  if (state.matches('initBootstrap')) {
    return <StepBootstrap>{children?.('initBootstrap', send)}</StepBootstrap>;
  }
  if (state.matches('emailIdentification')) {
    return <StepEmail>{children?.('emailIdentification', send)}</StepEmail>;
  }
  if (state.matches('phoneIdentification')) {
    return <StepPhone>{children?.('phoneIdentification', send)}</StepPhone>;
  }
  if (state.matches('smsChallenge')) {
    return <StepSms>{children?.('smsChallenge', send)}</StepSms>;
  }
  if (state.matches('biometricChallenge')) {
    return (
      <PasskeyChallenge>
        {children?.('biometricChallenge', send)}
      </PasskeyChallenge>
    );
  }
  if (state.matches('emailChallenge')) {
    return (
      <EmailChallenge>{children?.('emailChallenge', send)}</EmailChallenge>
    );
  }

  return null;
};

export default AuthRouter;
