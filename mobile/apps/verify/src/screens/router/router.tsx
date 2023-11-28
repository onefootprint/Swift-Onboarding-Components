import { useMachine } from '@xstate/react';
import React from 'react';

import createMachine from '@/utils/state-machine/machine';
import type { IdentifyResultProps } from '@/utils/state-machine/types';

import BasicInformation from '../basic-information';
import EmailIdentification from '../email-identification';
import Init from '../init';
import InitFailed from '../init-failed';
import PhoneIdentification from '../phone-identification';
import ResidentialAddress from '../residential-address';
import SmsChallenge from '../sms-challenge';
import Ssn from '../ssn';
import WithSdkArgs from './components/with-sdk-args';

type RouterProps = {
  authToken: string;
};

const Router = ({ authToken }: RouterProps) => {
  const [state, send] = useMachine(() => createMachine(authToken));
  const { obConfigAuth, identify } = state.context;

  const handleIdentified = ({
    email,
    phoneNumber,
    userFound,
    isUnverified,
    availableChallengeKinds,
    hasSyncablePassKey,
  }: IdentifyResultProps) => {
    send({
      type: 'identified',
      payload: {
        userFound,
        isUnverified,
        email,
        phoneNumber,
        hasSyncablePassKey,
        availableChallengeKinds,
      },
    });
  };

  if (state.matches('init')) {
    return (
      <Init
        authToken={authToken}
        onDone={({ error, data }) => {
          if (data && data.obConfig) {
            send({
              type: 'sdkArgsReceived',
              payload: { config: data.obConfig },
            });
          }
          if (error) {
            send({ type: 'failed' });
          }
        }}
      />
    );
  }

  if (state.matches('initFailed')) {
    return <InitFailed />;
  }

  if (state.matches('emailIdentification')) {
    if (obConfigAuth) {
      return (
        <EmailIdentification
          obConfigAuth={obConfigAuth}
          onComplete={handleIdentified}
        />
      );
    }
  }

  if (state.matches('phoneIdentification')) {
    if (obConfigAuth && identify) {
      return (
        <PhoneIdentification
          obConfigAuth={obConfigAuth}
          onComplete={handleIdentified}
          email={identify.email}
          onEmailEdit={() => send({ type: 'identifyReset' })}
        />
      );
    }
  }

  if (state.matches('smsChallenge')) {
    return (
      <SmsChallenge
        onDone={() => {
          send('done');
        }}
      />
    );
  }

  if (state.matches('basicInformation')) {
    return (
      <BasicInformation
        onDone={() => {
          send('done');
        }}
      />
    );
  }

  if (state.matches('residentialAddress')) {
    return (
      <ResidentialAddress
        onDone={() => {
          send('done');
        }}
      />
    );
  }

  if (state.matches('ssn')) {
    return (
      <Ssn
        onDone={() => {
          send('done');
        }}
      />
    );
  }

  return null;
};

const RouterWithSdkArgs = () => {
  return (
    <WithSdkArgs>
      {authToken => {
        return <Router authToken={authToken} />;
      }}
    </WithSdkArgs>
  );
};

export default RouterWithSdkArgs;
