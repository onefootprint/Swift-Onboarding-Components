import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import {
  ChallengeData,
  ChallengeKind,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useIdentifyVerify from '../../../../hooks/api/hosted/identify/use-identify-verify';
import useLoginChallenge from '../../../../hooks/api/hosted/identify/use-login-challenge';
import useSignupChallenge from '../../../../hooks/api/hosted/identify/use-signup-challenge';
import useUserEmail from '../../../../hooks/api/hosted/user/use-user-email';
import { useIdentifyMachine } from '../identify-machine-provider';
import Form from './components/form';

type PinVerificationProps = {
  title: string;
  onReceiveChallenge: (challenge: ChallengeData) => void;
  onChallengeSucceed: (authToken: string) => void;
  preferredChallengeKind: ChallengeKind;
};

const PinVerification = ({
  title,
  onReceiveChallenge,
  onChallengeSucceed,
  preferredChallengeKind,
}: PinVerificationProps) => {
  const { t } = useTranslation('pages.sms-challenge');
  const [state] = useIdentifyMachine();
  const {
    identify: {
      phoneNumber,
      email,
      userFound,
      successfulIdentifier,
      sandboxId,
    },
    obConfigAuth,
  } = state.context;
  const [challengeData, setChallengeData] = useState<ChallengeData>();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();

  const loginChallengeMutation = useLoginChallenge();
  const signupChallengeMutation = useSignupChallenge();
  const identifyVerifyMutation = useIdentifyVerify();
  const userEmailMutation = useUserEmail();
  const [isSuccess, setSuccess] = useState(false);
  const [isResend, setResend] = useState(false);
  const isPending = loginChallengeMutation.isLoading || !challengeData;
  const isVerifying =
    identifyVerifyMutation.isLoading || userEmailMutation.isLoading;

  const complete = (authToken: string) => {
    setSuccess(true);
    onChallengeSucceed(authToken);
  };

  const registerNewUserEmail = (authToken: string) => {
    if (!email) {
      console.error(
        'Found empty email while sending registering email for new user',
      );
      return;
    }

    userEmailMutation.mutate(
      { data: { email }, authToken },
      {
        onError: (error: unknown) => {
          console.error('Failed email verification request: ', error);
        },
        onSettled: () => {
          complete(authToken);
        },
      },
    );
  };

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerifyResponse) => {
    if (!authToken) {
      console.error(
        'Received empty auth token from successful sms pin verification.',
      );
      return;
    }

    if (userFound) {
      complete(authToken);
      return;
    }

    registerNewUserEmail(authToken);
  };

  const verifyPin = (pin: string) => {
    if (!challengeData) {
      console.error('No challenge data found after completing pin');
      return;
    }

    const { challengeToken } = challengeData;
    identifyVerifyMutation.mutate(
      {
        challengeResponse: pin,
        challengeToken,
        obConfigAuth,
        sandboxId,
      },
      {
        onSuccess: handlePinValidationSucceeded,
        onError: handleRequestError,
      },
    );
  };

  const handleRequestError = (error: unknown) => {
    showRequestErrorToast(error);
    console.error(error);
  };

  const handleRequestChallengeSuccess = (payload: LoginChallengeResponse) => {
    if (challengeData) {
      showResendConfirmation();
    }

    if (payload.challengeData.challengeKind !== preferredChallengeKind) {
      console.error(
        'Received biometric challenge after requesting login SMS challenge',
      );
      return;
    }

    onReceiveChallenge(payload.challengeData);
    setChallengeData(payload.challengeData);
  };

  const initiateSignupChallenge = () => {
    if (!phoneNumber) {
      console.error(
        'No phone number found while initiating signup SMS challenge',
      );
      return;
    }

    signupChallengeMutation.mutate(
      {
        phoneNumber,
        obConfigAuth,
        sandboxId,
      },
      {
        onSuccess: handleRequestChallengeSuccess,
        onError: handleRequestError,
      },
    );
  };

  const initiateLoginChallenge = () => {
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
        obConfigAuth,
        sandboxId,
      },
      {
        onSuccess: handleRequestChallengeSuccess,
        onError: handleRequestError,
      },
    );
  };

  const initiateChallenge = () => {
    if (userFound) {
      initiateLoginChallenge();
    } else {
      initiateSignupChallenge();
    }
  };

  const showResendConfirmation = () => {
    toast.show({
      title: t('toast.success.title'),
      description: t('toast.success.description'),
    });
  };

  const handleResend = () => {
    setResend(true);
    initiateChallenge();
  };

  useEffectOnce(() => {
    initiateChallenge();
  });

  return (
    <Form
      title={title}
      isPending={isPending}
      isVerifying={isVerifying}
      isSuccess={isSuccess}
      hasError={identifyVerifyMutation.isError}
      onComplete={verifyPin}
      resendDisabledUntil={challengeData?.retryDisabledUntil}
      onResend={handleResend}
      isResendLoading={isResend && loginChallengeMutation.isLoading}
    />
  );
};

export default PinVerification;
