import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { ChallengeData, IdentifyVerifyResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useIdentifyVerify from '../../../../../../hooks/api/hosted/identify/use-identify-verify';
import useSignupChallenge from '../../../../../../hooks/api/hosted/identify/use-signup-challenge';
import useUserEmail from '../../../../../../hooks/api/hosted/user/use-user-email';
import SmsChallengeVerification from '../../../../components/sms-challenge-verification';
import useIdentifierSuffix from '../../../../hooks/use-identifier-suffix';
import useIdentifyMachine from '../../../../hooks/use-identify-machine';
import getScrubbedPhoneNumber from '../../../../utils/get-scrubbed-phone-number';

const SUCCESS_EVENT_DELAY_MS = 1500;

const SignupChallenge = () => {
  const { t } = useTranslation('pages.challenge.signup-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    identify: { successfulIdentifier, email, phoneNumber },
    obConfigAuth,
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
        obConfigAuth,
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
      {
        phoneNumber: phoneNumberWithSuffix,
        obConfigAuth,
      },
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
      {
        phoneNumber: phoneNumberWithSuffix,
        obConfigAuth,
      },
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
