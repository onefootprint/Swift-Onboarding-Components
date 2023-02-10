import {
  useIdentify,
  useLoginChallenge,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast } from '@onefootprint/hooks';
import {
  ChallengeKind,
  IdentifyResponse,
  UserData,
  UserDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import { useIdentifyMachine } from 'src/components/identify-machine-provider';
import { Events } from 'src/hooks/use-identify-machine';

import { useLoginChallengePicker } from '../../../../components/login-challenge-picker/login-challenge-picker-provider';
import EmailIdentificationFooter from './components/email-identification-footer';
import EmailIdentificationForm from './components/email-identification-form';
import EmailIdentificationHeader from './components/email-identification-header';

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

const EmailIdentificationContent = () => {
  const [state, send] = useIdentifyMachine();
  const { device } = state.context;
  const deviceSupportsWebauthn =
    device.hasSupportForWebauthn && device.type === 'mobile';
  const showRequestErrorToast = useRequestErrorToast();
  const loginChallengePicker = useLoginChallengePicker();

  const identifyMutation = useIdentify();
  const loginChallengeMutation = useLoginChallenge();
  const isLoading =
    identifyMutation.isLoading || loginChallengeMutation.isLoading;

  const requestSmsChallenge = (email: string) => {
    loginChallengeMutation.mutate(
      {
        identifier: { email },
        preferredChallengeKind: ChallengeKind.sms,
      },
      {
        onSuccess({ challengeData }) {
          // If we request an sms challenge, we will always get one
          if (challengeData.challengeKind !== ChallengeKind.sms) {
            console.error(
              'Received biometric challenge despite requesting sms challenge',
            );
            return;
          }

          send({
            type: Events.smsChallengeInitiated,
            payload: {
              challengeData,
            },
          });
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const handleIdentifySuccess = (
    email: string,
    { userFound, availableChallengeKinds }: IdentifyResponse,
  ) => {
    send({
      type: Events.identifyCompleted,
      payload: {
        userFound,
        identifier: { email },
        availableChallengeKinds,
      },
    });

    // Continue to the phone registration page without initiating a challenge
    if (!userFound || !availableChallengeKinds?.length) {
      return;
    }

    // Device doesn't support biometrics or the user account doesn't have biometric creds registered:
    // No need to show the challenge picker, just initiate phone challenge
    const shouldRequestSms =
      !deviceSupportsWebauthn ||
      !availableChallengeKinds?.includes(ChallengeKind.biometric);
    if (shouldRequestSms) {
      requestSmsChallenge(email);
      return;
    }

    // We need to ask the user what challenge kind they prefer
    loginChallengePicker.show({ identifier: { email } });
  };

  const handleSubmit = (data: FormData) => {
    const { email } = data;
    identifyMutation.mutate(
      { identifier: { email } },
      {
        onSuccess: identifyResponse =>
          handleIdentifySuccess(email, identifyResponse),
        onError: showRequestErrorToast,
      },
    );
  };

  return (
    <>
      <EmailIdentificationHeader />
      <EmailIdentificationForm onSubmit={handleSubmit} isLoading={isLoading} />
      <EmailIdentificationFooter />
    </>
  );
};

export default EmailIdentificationContent;
