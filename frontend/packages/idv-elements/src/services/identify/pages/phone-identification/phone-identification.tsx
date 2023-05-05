import { useRequestErrorToast } from '@onefootprint/hooks';
import { IdentifyResponse } from '@onefootprint/types';
import React from 'react';

import { useIdentify } from '../../api-hooks';
import { useIdentifyMachine } from '../../components/identify-machine-provider';
import SandboxOutcomeFooter from '../../components/sandbox-outcome-footer';
import useIdentifierSuffix from '../../hooks/use-identifier-suffix';
import EmailPreview from './components/email-preview';
import Form from './components/form';
import Header from './components/header';

type FormData = {
  phoneNumber: string;
};

const PhoneIdentification = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { phoneNumber, email, sandboxSuffix: identifierSuffix },
    onboarding: { tenantPk },
    customAuthHeader,
  } = state.context;
  const identifyMutation = useIdentify();
  const { isLoading } = identifyMutation;
  const showRequestErrorToast = useRequestErrorToast();
  const idSuffix = useIdentifierSuffix();

  const handleSubmit = (formData: FormData) => {
    const phoneFromForm = formData.phoneNumber;
    const phoneNumberWithSuffix = idSuffix.append(phoneFromForm);
    // First we try to identify the user via phone number before sending any challenges
    identifyMutation.mutate(
      {
        identifier: { phoneNumber: phoneNumberWithSuffix },
        tenantPk,
        customAuthHeader,
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
              successfulIdentifier: { phoneNumber: phoneNumberWithSuffix },
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
      <SandboxOutcomeFooter sandboxSuffix={identifierSuffix} />
    </>
  );
};

export default PhoneIdentification;
