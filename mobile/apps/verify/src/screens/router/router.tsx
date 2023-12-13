import { type ChallengeData } from '@onefootprint/types';
import { Container } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import React from 'react';

import createMachine from '@/utils/state-machine/machine';
import type { IdentifyResultProps } from '@/utils/state-machine/types';

import BasicInformation from '../basic-information';
import Confirm from '../confirm';
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
  const {
    obConfigAuth,
    config,
    identify,
    kyc: { kycData, requirement: kycRequirement },
  } = state.context;
  const { authToken } = identify;

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

  const handleChallengeSucceed = (token: string) => {
    setTimeout(() => {
      send({
        type: 'challengeSucceeded',
        payload: {
          authToken: token,
        },
      });
    }, SUCCESS_EVENT_DELAY_MS);
  };

  if (state.matches('init')) {
    return (
      <Container center>
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
      </Container>
    );
  }

  if (state.matches('initFailed')) {
    return (
      <Container center>
        <InitFailed />
      </Container>
    );
  }

  if (state.matches('emailIdentification')) {
    if (obConfigAuth) {
      return (
        <Container>
          <EmailIdentification
            obConfigAuth={obConfigAuth}
            onComplete={handleIdentified}
          />
        </Container>
      );
    }
  }

  if (state.matches('phoneIdentification')) {
    if (obConfigAuth && identify) {
      return (
        <Container>
          <PhoneIdentification
            obConfigAuth={obConfigAuth}
            onComplete={handleIdentified}
            email={identify.identifyResult?.email}
            onEmailEdit={() => send({ type: 'identifyReset' })}
          />
        </Container>
      );
    }
  }

  if (state.matches('smsChallenge')) {
    if (obConfigAuth) {
      return (
        <Container>
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
        </Container>
      );
    }
  }

  if (state.matches('basicInformation')) {
    if (authToken && kycRequirement && kycData) {
      return (
        <Container scroll>
          <BasicInformation
            requirement={kycRequirement}
            data={kycData}
            authToken={authToken}
            onComplete={data => {
              send({
                type: 'dataSubmitted',
                payload: data,
              });
            }}
          />
        </Container>
      );
    }
  }

  if (state.matches('residentialAddress')) {
    if (config && kycData && authToken && kycRequirement) {
      return (
        <Container scroll>
          <ResidentialAddress
            requirement={kycRequirement}
            config={config}
            kycData={kycData}
            authToken={authToken}
            onComplete={data => {
              send({
                type: 'dataSubmitted',
                payload: data,
              });
            }}
          />
        </Container>
      );
    }
  }

  if (state.matches('ssn')) {
    if (authToken && kycRequirement && kycData) {
      return (
        <Container scroll>
          <Ssn
            requirement={kycRequirement}
            kycData={kycData}
            authToken={authToken}
            onComplete={data => {
              send({
                type: 'dataSubmitted',
                payload: data,
              });
            }}
          />
        </Container>
      );
    }
  }

  if (state.matches('confirm')) {
    if (kycRequirement && kycData && authToken && config) {
      return (
        <Container scroll>
          <Confirm
            requirement={kycRequirement}
            data={kycData}
            authToken={authToken}
            config={config}
            onComplete={() => console.log('clicked confirm')}
            onConfirm={data => {
              send({
                type: 'dataSubmitted',
                payload: data,
              });
            }}
          />
        </Container>
      );
    }
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
