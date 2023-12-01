import type { ChallengeData } from '@onefootprint/types';
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
  sdkAuthToken: string;
};

// We show the success screen for a short period of time so that the user can see
const SUCCESS_EVENT_DELAY_MS = 1500;

const Router = ({ sdkAuthToken }: RouterProps) => {
  const [state, send] = useMachine(() => createMachine(sdkAuthToken));
  const { obConfigAuth, identify } = state.context;

  const handleIdentified = ({
    email,
    phoneNumber,
    userFound,
    isUnverified,
    availableChallengeKinds,
    hasSyncablePassKey,
    successfulIdentifier,
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
        successfulIdentifier,
      },
    });
  };

  const handleChallengeSucceed = (authToken: string) => {
    setTimeout(() => {
      send({
        type: 'challengeSucceeded',
        payload: {
          authToken,
        },
      });
    }, SUCCESS_EVENT_DELAY_MS);
  };

  if (state.matches('init')) {
    return (
      <Init
        authToken={sdkAuthToken}
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
          email={identify.identifyResult?.email}
          onEmailEdit={() => send({ type: 'identifyReset' })}
        />
      );
    }
  }

  if (state.matches('smsChallenge')) {
    if (obConfigAuth) {
      return (
        <SmsChallenge
          identify={identify}
          obConfigAuth={obConfigAuth}
          onComplete={handleChallengeSucceed}
          onChallengeReceived={(challengeData: ChallengeData) =>
            send({
              type: 'challengeReceived',
              payload: challengeData,
            })
          }
        />
      );
    }
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
      {sdkAuthToken => {
        return <Router sdkAuthToken={sdkAuthToken} />;
      }}
    </WithSdkArgs>
  );
};

export default RouterWithSdkArgs;
