import { useRequestErrorToast } from '@onefootprint/hooks';
import { IdentifyResponse } from '@onefootprint/types';
import React from 'react';

import useIdentify from '../../../../hooks/api/hosted/identify/use-identify';
import { useIdentifyMachine } from '../../components/identify-machine-provider';
import SandboxOutcomeFooter from '../../components/sandbox-outcome-footer';
import EmailPreview from './components/email-preview';
import Form from './components/form';
import Header from './components/header';

type FormData = {
  phoneNumber: string;
};

const PhoneIdentification = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { phoneNumber, email, sandboxId },
    obConfigAuth,
  } = state.context;
  const identifyMutation = useIdentify();
  const { isLoading } = identifyMutation;
  const showRequestErrorToast = useRequestErrorToast();

  const handleSubmit = (formData: FormData) => {
    const phoneFromForm = formData.phoneNumber;
    // First we try to identify the user via phone number before sending any challenges
    identifyMutation.mutate(
      {
        identifier: { phoneNumber: phoneFromForm },
        obConfigAuth,
        sandboxId,
      },
      {
        onSuccess: ({
          userFound,
          availableChallengeKinds,
          hasSyncablePassKey,
        }: IdentifyResponse) => {
          send({
            type: 'identified',
            payload: {
              phoneNumber: phoneFromForm,
              userFound,
              successfulIdentifier: { phoneNumber: phoneFromForm },
              availableChallengeKinds,
              hasSyncablePassKey,
            },
          });
        },
        onError: error => {
          console.error(error);
          showRequestErrorToast(error);
        },
      },
    );
  };

  const handleChangeEmail = () => {
    send({ type: 'identifyReset' });
  };

  return (
    <>
      <Header />
      <EmailPreview email={email} onChange={handleChangeEmail} />
      <Form
        onSubmit={handleSubmit}
        isLoading={isLoading}
        defaultPhone={phoneNumber}
      />
      <SandboxOutcomeFooter sandboxId={sandboxId} />
    </>
  );
};

export default PhoneIdentification;
