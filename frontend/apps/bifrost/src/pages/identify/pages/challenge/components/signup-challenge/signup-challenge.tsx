import {
  useIdentifyVerify,
  useSignupChallenge,
  useUserEmail,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { ChallengeData, IdentifyVerifyResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import useIdentifyMachine from 'src/hooks/use-identify-machine';
import SmsChallengeVerification from 'src/pages/identify/components/sms-challenge-verification';
import useIdentifierSuffix from 'src/pages/identify/hooks/use-identifier-suffix';
import getScrubbedPhoneNumber from 'src/pages/identify/utils/get-scrubbed-phone-number';
import { useEffectOnce } from 'usehooks-ts';

const SUCCESS_EVENT_DELAY_MS = 1500;

const SignupChallenge = () => {
  const { t } = useTranslation('pages.challenge.signup-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    identify: { successfulIdentifier, email, phoneNumber },
    config,
  } = state.context;
  const [challengeData, setChallengeData] = useState<ChallengeData>();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();

  const signupChallengeMutation = useSignupChallenge();
  const identifyVerifyMutation = useIdentifyVerify();
  const userEmailMutation = useUserEmail();
  const [isSuccess, setSuccess] = useState(false);
  const [isResend, setResend] = useState(false);

  const idSuffix = useIdentifierSuffix();
  const emailWithSuffix = idSuffix.append(email);
  const phoneNumberWithSuffix = idSuffix.append(phoneNumber);

  // Either scrub the phone number collected from the previous steps, or use the
  // challenge data scrubbed number
  const scrubbedPhoneNumber = getScrubbedPhoneNumber({
    successfulIdentifier,
    phoneNumber,
    challengeData,
  });

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerifyResponse) => {
    if (!email) {
      console.error('Found empty email while sending signup challenge');
      return;
    }

    setSuccess(true);
    userEmailMutation.mutate(
      { data: { email: emailWithSuffix }, authToken },
      {
        onError: (error: unknown) => {
          console.error('Failed email verification request: ', error);
        },
        onSettled: () => {
          setTimeout(() => {
            send({
              type: 'challengeSucceeded',
              payload: {
                authToken,
              },
            });
          }, SUCCESS_EVENT_DELAY_MS);
        },
      },
    );
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
        onError: showRequestErrorToast,
      },
    );
  };

  const handleResend = () => {
    if (!phoneNumber) {
      console.error(
        'No valid phone number found while trying to request resend signup challenge',
      );
      return;
    }

    setResend(true);
    signupChallengeMutation.mutate(
      { phoneNumber: phoneNumberWithSuffix },
      {
        onSuccess: ({ challengeData: newChallengeData }) => {
          toast.show({
            title: t('toast.success.title'),
            description: t('toast.success.description'),
          });
          setChallengeData(newChallengeData);
        },
        onError: showRequestErrorToast,
      },
    );
  };

  useEffectOnce(() => {
    if (!phoneNumber) {
      console.error(
        'No valid phone number found while trying to request send signup challenge',
      );
      return;
    }

    signupChallengeMutation.mutate(
      { phoneNumber: phoneNumberWithSuffix },
      {
        onSuccess: ({ challengeData: newChallengeData }) => {
          setChallengeData(newChallengeData);
        },
        onError: showRequestErrorToast,
      },
    );
  });

  return (
    <SmsChallengeVerification
      title={scrubbedPhoneNumber && t('subtitle', { scrubbedPhoneNumber })}
      isSuccess={isSuccess}
      isVerifying={identifyVerifyMutation.isLoading}
      hasError={identifyVerifyMutation.isError}
      onComplete={handleComplete}
      onResend={handleResend}
      resendDisabledUntil={challengeData?.retryDisabledUntil}
      isResendLoading={isResend && signupChallengeMutation.isLoading}
    />
  );
};

export default SignupChallenge;
