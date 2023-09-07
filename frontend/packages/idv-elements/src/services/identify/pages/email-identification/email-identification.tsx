import { useRequestErrorToast } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { IdentifyResponse } from '@onefootprint/types';
import React from 'react';

import useIdentify from '../../../../hooks/api/hosted/identify/use-identify';
import { useIdentifyMachine } from '../../components/identify-machine-provider';
import LegalFooter from '../../components/legal-footer';
import SandboxOutcomeFooter from '../../components/sandbox-outcome-footer';
import EmailIdentificationForm from './components/form';
import EmailIdentificationHeader from './components/header';

type FormData = {
  email: string;
};

const EmailIdentification = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { email, sandboxId },
    obConfigAuth,
    config,
    showLogo,
  } = state.context;
  const identifyMutation = useIdentify();
  const { isLoading } = identifyMutation;
  const logoUrl = config?.logoUrl;
  const orgName = config?.orgName;
  const showRequestErrorToast = useRequestErrorToast();

  const handleSubmit = (formData: FormData) => {
    const { email: emailFromForm } = formData;
    identifyMutation.mutate(
      {
        identifier: { email: emailFromForm },
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
              userFound,
              email: emailFromForm,
              successfulIdentifier: { email: emailFromForm },
              hasSyncablePassKey,
              availableChallengeKinds,
            },
          });
        },
        onError: error => {
          console.error(
            'Error while identifying user on email-identification page',
            getErrorMessage(error),
          );
          showRequestErrorToast(error);
        },
      },
    );
  };

  return (
    <>
      <EmailIdentificationHeader
        showLogo={showLogo}
        orgName={orgName}
        logoUrl={logoUrl ?? undefined}
      />
      <EmailIdentificationForm
        defaultEmail={email}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <LegalFooter />
      <SandboxOutcomeFooter sandboxId={sandboxId} />
    </>
  );
};

export default EmailIdentification;
