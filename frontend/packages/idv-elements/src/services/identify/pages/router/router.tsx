import { useLogStateMachine } from '@onefootprint/dev-tools';
import type { IdDocOutcomes } from '@onefootprint/types';
import React, { useEffect } from 'react';

import useIdentifyMachine from '../../hooks/use-identify-machine';
import BiometricChallenge from '../biometric-challenge';
import ConfigInvalid from '../config-invalid';
import EmailChallenge from '../email-challenge';
import EmailIdentification from '../email-identification';
import Init from '../init';
import InitBootstrap from '../init-bootstrap';
import PhoneIdentification from '../phone-identification';
import SandboxOutcome from '../sandbox-outcome';
import SmsChallenge from '../sms-challenge';

export type DonePayload = {
  authToken: string;
  userFound: boolean;
  email?: string;
  phoneNumber?: string;
  idDocOutcome?: IdDocOutcomes;
};

type RouterProps = {
  onDone: (payload: DonePayload) => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useIdentifyMachine();
  const isDone = state.matches('success');
  const {
    challenge: { authToken },
    identify: { userFound, email, phoneNumber },
    idDocOutcome,
  } = state.context;
  useLogStateMachine('identify', state);

  useEffect(() => {
    if (!authToken) {
      return;
    }
    if (isDone) {
      onDone({
        authToken,
        userFound: !!userFound,
        email,
        phoneNumber,
        idDocOutcome,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, onDone]);

  return (
    <>
      {state.matches('init') && <Init />}
      {state.matches('configInvalid') && <ConfigInvalid />}
      {state.matches('sandboxOutcome') && <SandboxOutcome />}
      {state.matches('initBootstrap') && <InitBootstrap />}
      {state.matches('emailIdentification') && <EmailIdentification />}
      {state.matches('phoneIdentification') && <PhoneIdentification />}
      {state.matches('smsChallenge') && <SmsChallenge />}
      {state.matches('biometricChallenge') && <BiometricChallenge />}
      {state.matches('emailChallenge') && <EmailChallenge />}
    </>
  );
};

export default Router;
