import {
  useIdentifyVerify,
  useLoginChallenge,
  useSignupChallenge,
  useUserEmail,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import {
  ChallengeData,
  ChallengeKind,
  IdentifyVerifyResponse,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import useIdentifyMachine, { Events } from 'src/hooks/use-identify-machine';
import SmsChallengeVerification from 'src/pages/identify/components/sms-challenge-verification';

const SUCCESS_EVENT_DELAY_MS = 1500;

const PhoneVerificationForm = () => {
  const { t } = useTranslation('pages.phone-verification');
  const [state, send] = useIdentifyMachine();
  const { context } = state;
  const {
    identify: { email, phoneNumber, userFound },
    challenge: { challengeData },
    tenantPk,
  } = context;

  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();

  const loginChallengeMutation = useLoginChallenge();
  const signupChallengeMutation = useSignupChallenge();
  const identifyVerifyMutation = useIdentifyVerify();
  const userEmailMutation = useUserEmail();

  const isLoading =
    identifyVerifyMutation.isLoading || userEmailMutation.isLoading;
  const [isSuccess, setSuccess] = useState(false);
  const hasError = identifyVerifyMutation.isError;

  const delayedSuccessTransition = (authToken: string) => {
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

    if (userFound) {
      delayedSuccessTransition(authToken);
      return;
    }

    if (!email) {
      // If no email is found, we will let collect-kyc-data machine collect a new email &
      // send a verification email.
      console.error(
        'Found empty email while trying to send verification email.',
      );
      delayedSuccessTransition(authToken);
      return;
    }

    userEmailMutation.mutate(
      { data: { email }, authToken },
      {
        onSuccess: () => {
          delayedSuccessTransition(authToken);
        },
        onError: (error: unknown) => {
          showRequestErrorToast(error);
          console.error('Failed email verification request: ', error);
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
        tenantPk,
      },
      {
        onSuccess: handlePinValidationSucceeded,
        onError: showRequestErrorToast,
      },
    );
  };

  const handleChallengeResendSuccess = (newChallengeData: ChallengeData) => {
    toast.show({
      title: t('toast.success.title'),
      description: t('toast.success.description'),
    });
    send({
      type: Events.challengeInitiated,
      payload: {
        challengeData: newChallengeData,
      },
    });
  };

  const requestSignupChallenge = () => {
    if (!phoneNumber) {
      console.error(
        'No valid phone number found while trying to request resend signup challenge',
      );
      return;
    }
    signupChallengeMutation.mutate(
      { phoneNumber },
      {
        onSuccess: ({ challengeData: newChallengeData }) => {
          handleChallengeResendSuccess(newChallengeData);
        },
        onError: showRequestErrorToast,
      },
    );
  };

  // TODO: remember which identifier succeeded in identify call and use that one
  const requestLoginChallenge = () => {
    let identifier;
    if (email) {
      identifier = { email };
    } else if (phoneNumber) {
      identifier = { phoneNumber };
    } else {
      console.error(
        'No valid identifier found while trying to request resend login challenge',
      );
      return;
    }

    loginChallengeMutation.mutate(
      {
        identifier,
        preferredChallengeKind: ChallengeKind.sms,
      },
      {
        onSuccess({ challengeData: newChallengeData }) {
          handleChallengeResendSuccess(newChallengeData);
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const handleResend = () => {
    // Depending on if the user's phone is known (if this is a new user who went
    // through the phone-registration page) handle resending differently
    if (userFound) {
      requestLoginChallenge();
    } else if (phoneNumber) {
      requestSignupChallenge();
    }
  };

  return (
    <SmsChallengeVerification
      isSuccess={isSuccess}
      isLoading={isLoading}
      hasError={hasError}
      onComplete={handleComplete}
      onResend={handleResend}
      resendDisabledUntil={challengeData?.retryDisabledUntil}
    />
  );
};

export default PhoneVerificationForm;
