import { useIdentify } from '@onefootprint/footprint-elements';
import { useRequestErrorToast } from '@onefootprint/hooks';
import {
  IdentifyResponse,
  UserData,
  UserDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import { useIdentifyMachine } from 'src/components/identify-machine-provider';
import SandboxOutcomeFooter from 'src/components/sandbox-outcome-footer';
import { Events } from 'src/hooks/use-identify-machine';
import LegalFooter from 'src/pages/identify/components/legal-footer';

import useIdentifierSuffix from '../../hooks/use-identifier-suffix';
import EmailIdentificationForm from './components/email-identification-form';
import EmailIdentificationHeader from './components/email-identification-header';

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

const EmailIdentification = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { email },
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
            type: Events.identified,
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
      <SandboxOutcomeFooter />
    </>
  );
};

export default EmailIdentification;
