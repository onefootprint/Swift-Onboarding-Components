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
import SandboxOutcomeFooter from 'src/components/sandbox-outcome-footer';
import { Events } from 'src/hooks/use-identify-machine';
import LegalFooter from 'src/pages/identify/components/legal-footer';

import { useLoginChallengeBottomSheet } from '../../../../components/login-challenge-bottom-sheet/login-challenge-bottom-sheet-provider';
import useIdentifierSuffix from '../../../../hooks/use-identifier-suffix';
import EmailIdentificationForm from './components/email-identification-form';
import EmailIdentificationHeader from './components/email-identification-header';

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

const EmailIdentificationContent = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { email: smEmail },
    device,
  } = state.context;
  const deviceSupportsWebauthn =
    device.hasSupportForWebauthn && device.type === 'mobile';
  const showRequestErrorToast = useRequestErrorToast();
  const loginChallengeBottomSheet = useLoginChallengeBottomSheet();
  const idSuffix = useIdentifierSuffix();

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
            type: Events.challengeInitiated,
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
    {
      userFound,
      availableChallengeKinds,
      hasSyncablePassKey,
    }: IdentifyResponse,
  ) => {
    send({
      type: Events.identified,
      payload: {
        userFound,
        email,
        successfulIdentifier: { email },
        hasSyncablePassKey,
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
    loginChallengeBottomSheet.show({ identifier: { email } });
  };

  const handleSubmit = (formData: FormData) => {
    const email = idSuffix.append(formData.email);
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
      <EmailIdentificationForm
        defaultEmail={idSuffix.remove(smEmail)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <LegalFooter />
      <SandboxOutcomeFooter />
    </>
  );
};

export default EmailIdentificationContent;
