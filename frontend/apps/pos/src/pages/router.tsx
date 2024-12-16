import type { PublicOnboardingConfiguration } from '@onefootprint/request-types';
import { useState } from 'react';
import AddressDataStep from './address-data-step';
import BasicDataStep from './basic-data-step';
import CustomDataStep from './custom-data-step';
import IntroStep from './intro-step';
import WaitingConfirmation from './waiting-confirmation';

type RouterProps = {
  onboardingConfig: PublicOnboardingConfiguration;
};

const Router = ({ onboardingConfig }: RouterProps) => {
  const [state, setContext] = useState(() => getInitialState(onboardingConfig));

  return (
    <>
      {state.step === 'intro' && (
        <IntroStep
          onDone={data => {
            setContext(prev => ({
              ...prev,
              step: 'waiting-confirmation',
              data: { phoneNumber: data.phoneNumber, email: data.email },
              tokens: {
                challengeToken: data.challengeToken,
                authToken: data.token,
              },
            }));
          }}
        />
      )}
      {state.step === 'waiting-confirmation' && (
        <WaitingConfirmation
          tokens={state.tokens}
          onDone={authToken => {
            setContext(prev => ({
              ...prev,
              step: 'basic-data',
              tokens: {
                ...prev.tokens,
                authToken,
              },
            }));
          }}
          onCancel={() => {
            setContext(getInitialState(onboardingConfig));
          }}
        />
      )}
      {state.step === 'basic-data' && (
        <BasicDataStep
          authToken={state.tokens.authToken}
          defaultValues={state.userData}
          onSubmit={data => {
            setContext(prev => ({
              ...prev,
              step: 'address-data',
              userData: {
                ...prev.userData,
                ...data,
              },
            }));
          }}
        />
      )}
      {state.step === 'address-data' && (
        <AddressDataStep
          authToken={state.tokens.authToken}
          defaultValues={state.userData}
          onSubmit={data => {
            setContext(prev => ({
              ...prev,
              step: 'next-step',
              userData: {
                ...prev.userData,
                ...data,
              },
            }));
          }}
        />
      )}
      {state.step === 'custom-data' && (
        <CustomDataStep
          authToken={state.tokens.authToken}
          defaultValues={state.userData}
          onSubmit={data => {
            console.log(data);
          }}
        />
      )}
    </>
  );
};

const getInitialState = (onboardingConfig: PublicOnboardingConfiguration) => {
  return {
    step: 'intro',
    onboardingConfig,
    tokens: {
      challengeToken: '',
      authToken: '',
    },
    userData: {
      phoneNumber: '',
      email: '',
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipcode: '',
      category: '',
      awd: '',
      reservedCarClass: '',
      elor: 0,
      rentalZone: '',
      under24hRental: false,
      businessLeisure: false,
      localMarketIndicator: false,
      distributionChannel: '',
    },
  };
};

export default Router;
