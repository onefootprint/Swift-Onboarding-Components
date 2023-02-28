import { useIdentify } from '@onefootprint/footprint-elements';
import { useRequestErrorToast } from '@onefootprint/hooks';
import {
  IdentifyResponse,
  UserData,
  UserDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import SandboxOutcomeFooter from 'src/components/sandbox-outcome-footer';
import useIdentifyMachine, { Events } from 'src/hooks/use-identify-machine';

import useIdentifierSuffix from '../../hooks/use-identifier-suffix';
import PhoneIdentificationEmailPreview from './components/phone-identification-email-preview';
import PhoneIdentificationForm from './components/phone-identification-form';
import PhoneIdentificationHeader from './components/phone-identification-header';

type FormData = Required<Pick<UserData, UserDataAttribute.phoneNumber>>;

const PhoneIdentification = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { phoneNumber, email },
  } = state.context;
  const identifyMutation = useIdentify();
  const { isLoading } = identifyMutation;
  const showRequestErrorToast = useRequestErrorToast();
  const idSuffix = useIdentifierSuffix();

  const handleSubmit = (formData: FormData) => {
    const phoneFromForm = formData[UserDataAttribute.phoneNumber];
    const phoneNumberWithSuffix = idSuffix.append(phoneFromForm);
    // First we try to identify the user via phone number before sending any challenges
    identifyMutation.mutate(
      { identifier: { phoneNumber: phoneNumberWithSuffix } },
      {
        onSuccess: ({
          userFound,
          availableChallengeKinds,
          hasSyncablePassKey,
        }: IdentifyResponse) => {
          send({
            type: Events.identified,
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
    send({ type: Events.identifyReset });
  };

  return (
    <>
      <PhoneIdentificationHeader />
      <PhoneIdentificationEmailPreview
        email={email}
        onChange={handleChangeEmail}
      />
      <PhoneIdentificationForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        defaultPhone={phoneNumber}
      />
      <SandboxOutcomeFooter />
    </>
  );
};

export default PhoneIdentification;
