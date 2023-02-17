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
import useSandboxMode from 'src/hooks/use-sandbox-mode/use-sandbox-mode';

import { useLoginChallengeBottomSheet } from '../../../../components/login-challenge-bottom-sheet/login-challenge-bottom-sheet-provider';
import PhoneRegistrationEmailPreview from './components/phone-registration-email-preview';
import PhoneRegistrationForm from './components/phone-registration-form';
import PhoneRegistrationHeader from './components/phone-registration-header';

type FormData = Required<Pick<UserData, UserDataAttribute.phoneNumber>>;

const PhoneRegistrationContent = () => {
  const { isSandbox } = useSandboxMode();
  const [state, send] = useIdentifyMachine();
  const { device, phone, email } = state.context;
  const deviceSupportsWebauthn =
    device.hasSupportForWebauthn && device.type === 'mobile';
  const showRequestErrorToast = useRequestErrorToast();
  const loginChallengeBottomSheet = useLoginChallengeBottomSheet();

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

  const requestSignupChallenge = (phoneNumber: string) => {
    signupChallengeMutation.mutate(
      { phoneNumber },
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
    loginChallengeBottomSheet.show({ identifier: { phoneNumber } });
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

  const handleChangeEmail = () => {
    send({ type: Events.emailChangeRequested });
  };

  return (
    <>
      <PhoneRegistrationHeader />
      <PhoneRegistrationEmailPreview
        email={email}
        onChange={handleChangeEmail}
      />
      <PhoneRegistrationForm
        isSandbox={isSandbox}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        defaultPhone={phone}
      />
    </>
  );
};

export default PhoneRegistrationContent;
