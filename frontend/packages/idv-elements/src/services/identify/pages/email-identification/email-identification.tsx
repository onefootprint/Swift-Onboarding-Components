import { useRequestErrorToast } from '@onefootprint/hooks';
import { IdentifyResponse } from '@onefootprint/types';
import React from 'react';

import useIdentify from '../../../../hooks/api/hosted/identify/use-identify';
import { useIdentifyMachine } from '../../components/identify-machine-provider';
import LegalFooter from '../../components/legal-footer';
import SandboxOutcomeFooter from '../../components/sandbox-outcome-footer';
import useIdentifierSuffix from '../../hooks/use-identifier-suffix';
import EmailIdentificationForm from './components/form';
import EmailIdentificationHeader from './components/header';

type FormData = {
  email: string;
};

const EmailIdentification = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { email, sandboxSuffix: identifierSuffix },
    obConfigAuth,
  } = state.context;
  const identifyMutation = useIdentify();
  const { isLoading } = identifyMutation;
  const showRequestErrorToast = useRequestErrorToast();
  const idSuffix = useIdentifierSuffix();

  const handleSubmit = (formData: FormData) => {
    const emailFromForm = formData.email;
    const emailWithSuffix = idSuffix.append(emailFromForm);
    identifyMutation.mutate(
      {
        identifier: { email: emailWithSuffix },
        obConfigAuth,
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
              userFound,
              email: emailFromForm,
              successfulIdentifier: { email: emailWithSuffix },
              hasSyncablePassKey,
              availableChallengeKinds,
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

  return (
    <>
      <EmailIdentificationHeader />
      <EmailIdentificationForm
        defaultEmail={email}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <LegalFooter />
      <SandboxOutcomeFooter sandboxSuffix={identifierSuffix} />
    </>
  );
};

export default EmailIdentification;
