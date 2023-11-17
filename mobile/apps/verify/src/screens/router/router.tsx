import { useMachine } from '@xstate/react';
import React from 'react';

import createMachine from '@/utils/state-machine/machine';

import BasicInformation from '../basic-information';
import EmailIdentification from '../email-identification';
import PhoneIdentification from '../phone-identification';
import ResidentialAddress from '../residential-address';
import SmsChallenge from '../sms-challenge';
import Ssn from '../ssn';

const Router = () => {
  const [state, send] = useMachine(() => createMachine());

  if (state.matches('emailIdentification')) {
    return (
      <EmailIdentification
        onDone={() => {
          send('proceedToNext');
        }}
      />
    );
  }

  if (state.matches('phoneIdentification')) {
    return (
      <PhoneIdentification
        onDone={() => {
          send('proceedToNext');
        }}
      />
    );
  }

  if (state.matches('smsChallenge')) {
    return (
      <SmsChallenge
        onDone={() => {
          send('proceedToNext');
        }}
      />
    );
  }

  if (state.matches('basicInformation')) {
    return (
      <BasicInformation
        onDone={() => {
          send('proceedToNext');
        }}
      />
    );
  }

  if (state.matches('residentialAddress')) {
    return (
      <ResidentialAddress
        onDone={() => {
          send('proceedToNext');
        }}
      />
    );
  }

  if (state.matches('ssn')) {
    return (
      <Ssn
        onDone={() => {
          send('proceedToNext');
        }}
      />
    );
  }

  return null;
};

export default Router;
