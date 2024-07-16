import type { ChallengeData } from '@onefootprint/types';
import { Container } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import React from 'react';

import ErrorComponent from '@/components/error';
import createMachine from '@/utils/state-machine/machine';
import type { IdentifyResultProps } from '@/utils/state-machine/types';

import BasicInformation from '../basic-information';
import CheckRequirements from '../check-requirements';
import Complete from '../complete';
import Confirm from '../confirm';
import EmailIdentification from '../email-identification';
import IncompatibleRequirementsError from '../incompatible-requirements-error';
import Init from '../init';
import InitFailed from '../init-failed';
import PhoneIdentification from '../phone-identification';
import Process from '../process';
import ResidentialAddress from '../residential-address';
import SandboxOutcome from '../sandbox-outcome';
import SkipLiveness from '../skip-liveness';
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
    startedDataCollection,
    collectedKycData,
    sandboxOutcome,
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

  if (state.matches('sandboxOutcome')) {
    return (
      <Container scroll>
        <SandboxOutcome
          onSubmit={outcome =>
            send({
              type: 'sandboxOutcomeReceived',
              payload: outcome,
            })
          }
          config={config}
          onIdDocRequirement={() =>
            send({
              type: 'requiresIdDoc',
            })
          }
        />
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
            sandboxId={sandboxOutcome?.sandboxId}
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
            sandboxId={sandboxOutcome?.sandboxId}
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
            sandboxId={sandboxOutcome?.sandboxId}
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

  if (state.matches('requirements')) {
    if (authToken) {
      return (
        <Container center>
          <CheckRequirements
            authToken={authToken}
            onComplete={payload =>
              send({
                type: 'requirementsReceived',
                payload,
              })
            }
            startedDataCollection={startedDataCollection}
            collectedKycData={collectedKycData}
          />
        </Container>
      );
    }
  }

  if (state.matches('basicInformation')) {
    if (authToken && kycRequirement) {
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
            onComplete={() => send('dataConfirmed')}
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

  if (state.matches('liveness')) {
    if (authToken) {
      return (
        <Container center>
          <SkipLiveness
            authToken={authToken}
            onComplete={() => send('skipLiveness')}
            onError={() => send('skipLivenessError')}
          />
        </Container>
      );
    }
  }

  if (state.matches('process')) {
    if (authToken) {
      return (
        <Container center>
          <Process authToken={authToken} onDone={() => send('done')} overallOutcome={sandboxOutcome?.overallOutcome} />
        </Container>
      );
    }
  }

  if (state.matches('incompatibleRequirements')) {
    return (
      <Container center>
        <IncompatibleRequirementsError />
      </Container>
    );
  }

  if (state.matches('completed')) {
    return (
      <Container center>
        <Complete />
      </Container>
    );
  }

  if (state.matches('error')) {
    return (
      <Container center>
        <ErrorComponent />
      </Container>
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
