import { useRequestErrorToast } from '@onefootprint/hooks';
import {
  IdentifyResponse,
  UserData,
  UserDataAttribute,
} from '@onefootprint/types';
import React from 'react';

import { useIdentify } from '../../api-hooks';
import { useIdentifyMachine } from '../../components/identify-machine-provider';
import LegalFooter from '../../components/legal-footer';
import SandboxOutcomeFooter from '../../components/sandbox-outcome-footer';
import useIdentifierSuffix from '../../hooks/use-identifier-suffix';
import EmailIdentificationForm from './components/form';
import EmailIdentificationHeader from './components/header';

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

const EmailIdentification = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { email, sandboxSuffix: identifierSuffix },
  } = state.context;
  const identifyMutation = useIdentify();
  const { isLoading } = identifyMutation;
  const showRequestErrorToast = useRequestErrorToast();
  const idSuffix = useIdentifierSuffix();

  const handleSubmit = (formData: FormData) => {
    const emailFromForm = formData[UserDataAttribute.email];
    const emailWithSuffix = idSuffix.append(emailFromForm);
    identifyMutation.mutate(
      { identifier: { email: emailWithSuffix } },
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
