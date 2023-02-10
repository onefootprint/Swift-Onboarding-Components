import {
  useIdentify,
  useLoginChallenge,
  useSignupChallenge,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast } from '@onefootprint/hooks';
import {
  ChallengeKind,
  IdentifyResponse,
  UserData,
  UserDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import useIdentifyMachine, { Events } from 'src/hooks/use-identify-machine';

import { useLoginChallengePicker } from '../../../../components/login-challenge-picker/login-challenge-picker-provider';
import PhoneRegistrationEmailPreview from './components/phone-registration-email-preview';
import PhoneRegistrationForm from './components/phone-registration-form';
import PhoneRegistrationHeader from './components/phone-registration-header';

type FormData = Required<Pick<UserData, UserDataAttribute.phoneNumber>>;

const PhoneRegistrationContent = () => {
  const [state, send] = useIdentifyMachine();
  const { device } = state.context;
  const deviceSupportsWebauthn =
    device.hasSupportForWebauthn && device.type === 'mobile';
  const showRequestErrorToast = useRequestErrorToast();
  const loginChallengePicker = useLoginChallengePicker();

  const identifyMutation = useIdentify();
  const loginChallengeMutation = useLoginChallenge();
  const signupChallengeMutation = useSignupChallenge();

  const isLoading =
    identifyMutation.isLoading ||
    loginChallengeMutation.isLoading ||
    signupChallengeMutation.isLoading;

  const requestSmsChallenge = (phoneNumber: string) => {
    loginChallengeMutation.mutate(
      {
        identifier: { phoneNumber },
        preferredChallengeKind: ChallengeKind.sms,
      },
      {
        onSuccess({ challengeData }) {
          // If we request an sms challenge, we will always get one
          if (challengeData.challengeKind !== ChallengeKind.sms) {
            showRequestErrorToast();
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

  const requestSignupChallenge = (phone: string) => {
    signupChallengeMutation.mutate(
      { phoneNumber: phone },
      {
        onSuccess({ challengeData }) {
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
    phoneNumber: string,
    { userFound, availableChallengeKinds }: IdentifyResponse,
  ) => {
    send({
      type: Events.identifyCompleted,
      payload: {
        userFound,
        identifier: { phoneNumber },
      },
    });

    // We failed to identify the user by email + phone, initiate sign-up flow
    if (!userFound || !availableChallengeKinds?.length) {
      requestSignupChallenge(phoneNumber);
      return;
    }

    // Device doesn't support biometrics or the user account doesn't have biometric creds registered:
    // No need to show the challenge picker, just initiate phone challenge
    const shouldRequestSms =
      !deviceSupportsWebauthn ||
      !availableChallengeKinds?.includes(ChallengeKind.biometric);
    if (shouldRequestSms) {
      requestSmsChallenge(phoneNumber);
      return;
    }

    // We need to ask the user what challenge kind they prefer
    loginChallengePicker.show({ identifier: { phoneNumber } });
  };

  const handleSubmit = (formData: FormData) => {
    const phoneNumber = formData[UserDataAttribute.phoneNumber];
    // First we try to identify the user via phone number before sending any challenges
    identifyMutation.mutate(
      { identifier: { phoneNumber } },
      {
        onSuccess: identifyResponse =>
          handleIdentifySuccess(phoneNumber, identifyResponse),
        onError: showRequestErrorToast,
      },
    );
  };

  return (
    <>
      <PhoneRegistrationHeader />
      <PhoneRegistrationEmailPreview />
      <PhoneRegistrationForm onSubmit={handleSubmit} isLoading={isLoading} />
    </>
  );
};

export default PhoneRegistrationContent;
