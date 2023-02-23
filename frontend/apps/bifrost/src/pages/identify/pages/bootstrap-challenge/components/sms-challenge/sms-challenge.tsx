import {
  useIdentifyVerify,
  useLoginChallenge,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import {
  ChallengeKind,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import useIdentifyMachine, { Events } from 'src/hooks/use-identify-machine';
import SmsChallengeVerification from 'src/pages/identify/components/sms-challenge-verification';
import {
  MachineChallengeContext,
  MachineIdentifyContext,
} from 'src/utils/state-machine/identify';
import { useEffectOnce } from 'usehooks-ts';

const SUCCESS_EVENT_DELAY_MS = 1500;

const getScrubbedPhoneNumber = (
  identifyContext: MachineIdentifyContext,
  challengeContext: MachineChallengeContext,
) => {
  const { successfulIdentifier, phoneNumber } = identifyContext;
  const { challengeData } = challengeContext;
  const identifyPhone =
    successfulIdentifier && 'phoneNumber' in successfulIdentifier
      ? phoneNumber
      : null;
  const challengePhone = challengeData?.scrubbedPhoneNumber;
  // Give preference to the scrubbed phone number from challenge data
  const displayPhone = challengePhone || identifyPhone;
  const scrubbedPhoneNumber = displayPhone
    ?.replaceAll('*', '•')
    .replaceAll('-', ' ');

  return scrubbedPhoneNumber;
};

const SmsChallenge = () => {
  const { t } = useTranslation('pages.bootstrap-challenge.sms-challenge');
  const [state, send] = useIdentifyMachine();
  const { identify, config, challenge } = state.context;
  const { successfulIdentifier } = identify;
  const { challengeData } = challenge;

  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();

  const loginChallengeMutation = useLoginChallenge();
  const identifyVerifyMutation = useIdentifyVerify();

  const [isSuccess, setSuccess] = useState(false);
  const hasError = identifyVerifyMutation.isError;
  const isLoading =
    loginChallengeMutation.isLoading || identifyVerifyMutation.isLoading;
  const scrubbedPhoneNumber = getScrubbedPhoneNumber(identify, challenge);

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerifyResponse) => {
    // Only send the user email to the backend if we are onboarding the user for
    // the first time
    if (!authToken) {
      console.error(
        'Received empty auth token from successful sms pin verification.',
      );
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      send({
        type: Events.challengeSucceeded,
        payload: {
          authToken,
        },
      });
    }, SUCCESS_EVENT_DELAY_MS);
  };

  const handleRequestChallengeSuccess = (payload: LoginChallengeResponse) => {
    if (payload.challengeData.challengeKind !== ChallengeKind.sms) {
      console.error(
        'Received biometric challenge after requesting bootstrap SMS challenge',
      );
      return;
    }
    send({
      type: Events.challengeInitiated,
      payload: {
        challengeData: payload.challengeData,
      },
    });
  };

  const handleComplete = (pin: string) => {
    if (!challengeData) {
      return;
    }

    const { challengeToken } = challengeData;
    identifyVerifyMutation.mutate(
      {
        challengeResponse: pin,
        challengeToken,
        tenantPk: config?.key,
      },
      {
        onSuccess: handlePinValidationSucceeded,
        onError: handleRequestError,
      },
    );
  };

  const handleResend = () => {
    if (!successfulIdentifier) {
      console.error(
        'No successful identifier found while resending bootstrap SMS challenge',
      );
      return;
    }

    loginChallengeMutation.mutate(
      {
        identifier: successfulIdentifier,
        preferredChallengeKind: ChallengeKind.sms,
      },
      {
        onSuccess: payload => {
          toast.show({
            title: t('resend-success.title'),
            description: t('resend-success.description'),
          });
          handleRequestChallengeSuccess(payload);
        },
        onError: handleRequestError,
      },
    );
  };

  const handleRequestError = (error: unknown) => {
    showRequestErrorToast(error);
    console.error(error);
  };

  useEffectOnce(() => {
    if (!successfulIdentifier) {
      console.error(
        'No successful identifier found while initiating bootstrap SMS challenge',
      );
      return;
    }

    loginChallengeMutation.mutate(
      {
        identifier: successfulIdentifier,
        preferredChallengeKind: ChallengeKind.sms,
      },
      {
        onSuccess: handleRequestChallengeSuccess,
        onError: handleRequestError,
      },
    );
  });

  return (
    <SmsChallengeVerification
      title={scrubbedPhoneNumber && t('title', { scrubbedPhoneNumber })}
      isLoading={isLoading}
      isSuccess={isSuccess}
      hasError={hasError}
      onComplete={handleComplete}
      resendDisabledUntil={challengeData?.retryDisabledUntil}
      onResend={handleResend}
    />
  );
};

export default SmsChallenge;
