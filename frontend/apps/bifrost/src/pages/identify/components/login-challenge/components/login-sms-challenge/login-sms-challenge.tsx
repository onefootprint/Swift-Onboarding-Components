import {
  useIdentifyVerify,
  useLoginChallenge,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import {
  ChallengeData,
  ChallengeKind,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import useIdentifyMachine, { Events } from 'src/hooks/use-identify-machine';
import SmsChallengeVerification from 'src/pages/identify/components/sms-challenge-verification';
import getScrubbedPhoneNumber from 'src/pages/identify/utils/get-scrubbed-phone-number';
import { useEffectOnce } from 'usehooks-ts';

const SUCCESS_EVENT_DELAY_MS = 1500;

const LoginSmsChallenge = () => {
  const { t } = useTranslation('components.login-challenge.sms-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    identify: { phoneNumber, successfulIdentifier },
    config,
  } = state.context;
  const [challengeData, setChallengeData] = useState<ChallengeData>();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();

  const loginChallengeMutation = useLoginChallenge();
  const identifyVerifyMutation = useIdentifyVerify();
  const [isSuccess, setSuccess] = useState(false);
  const [isResend, setResend] = useState(false);

  // Either scrub the phone number collected from the previous steps, or use the
  // challenge data scrubbed number
  const scrubbedPhoneNumber = getScrubbedPhoneNumber({
    successfulIdentifier,
    phoneNumber,
    challengeData,
  });
  // Sometimes, a new challenge may not have been re-generated upon mount because
  // of rate limiting (they recently sent a code), to avoid shifting the components
  // up and down, still show a generic title if we don't have the scrubbed phone number.
  // The user can always resend the code if they didn't already receive it.
  const title = scrubbedPhoneNumber
    ? t('title-with-phone', { scrubbedPhoneNumber })
    : t('title-without-phone');

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerifyResponse) => {
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
        'Received biometric challenge after requesting login SMS challenge',
      );
      return;
    }

    setChallengeData(payload.challengeData);
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
        'No successful identifier found while resending login SMS challenge',
      );
      return;
    }

    setResend(true);
    loginChallengeMutation.mutate(
      {
        identifier: successfulIdentifier,
        preferredChallengeKind: ChallengeKind.sms,
      },
      {
        onSuccess: payload => {
          toast.show({
            title: t('toast.success.title'),
            description: t('toast.success.description'),
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
        'No successful identifier found while initiating login SMS challenge',
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
      title={title}
      isVerifying={identifyVerifyMutation.isLoading}
      isSuccess={isSuccess}
      hasError={identifyVerifyMutation.isError}
      onComplete={handleComplete}
      resendDisabledUntil={challengeData?.retryDisabledUntil}
      onResend={handleResend}
      isResendLoading={isResend && loginChallengeMutation.isLoading}
    />
  );
};

export default LoginSmsChallenge;
