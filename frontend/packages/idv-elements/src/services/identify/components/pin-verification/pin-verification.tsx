import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type {
  ChallengeData,
  ChallengeKind,
  Identifier,
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
  onReceiveChallenge?: (challenge: ChallengeData) => void;
  onChallengeSucceed: (authToken: string) => void;
  preferredChallengeKind: ChallengeKind;
  identifier: Identifier;
};

const PinVerification = ({
  title,
  onReceiveChallenge,
  onChallengeSucceed,
  preferredChallengeKind,
  identifier,
}: PinVerificationProps) => {
  const { t } = useTranslation('components.pin-verification');
  const [state] = useIdentifyMachine();
  const {
    identify: { email, userFound, sandboxId },
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
          console.error(
            'Failed email verification request:',
            getErrorMessage(error),
          );
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
        'Received empty auth token from successful challenge pin verification.',
      );
      return;
    }

    // If user already had a vault, no need to save the email again
    // If the new user signup challenge was initiated with an email OTP,
    // the backend will automatically save the email to the vault for us
    if (userFound || 'email' in identifier) {
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
        onError: (error: unknown) => {
          console.error('Failed to verify pin:', getErrorMessage(error));
          showRequestErrorToast(error);
        },
      },
    );
  };

  const handleRequestChallengeSuccess = (payload: LoginChallengeResponse) => {
    // Check whether is resend, but isResend state might not have updated yet
    if (challengeData) {
      showResendConfirmation();
    }

    if (payload.challengeData.challengeKind !== preferredChallengeKind) {
      console.error(
        'Received biometric challenge after requesting login challenge',
      );
      return;
    }

    onReceiveChallenge?.(payload.challengeData);
    setChallengeData(payload.challengeData);
  };

  const initiateSignupChallenge = () => {
    signupChallengeMutation.mutate(
      {
        ...identifier,
        obConfigAuth,
        sandboxId,
      },
      {
        onSuccess: handleRequestChallengeSuccess,
        onError: (error: unknown) => {
          console.error(
            'Failed to initiate signup challenge:',
            getErrorMessage(error),
          );
          showRequestErrorToast(error);
        },
      },
    );
  };

  const initiateLoginChallenge = () => {
    loginChallengeMutation.mutate(
      {
        identifier,
        preferredChallengeKind,
        obConfigAuth,
        sandboxId,
        // Check whether is resend, but isResend state might not have updated yet
        isResend: !!challengeData,
      },
      {
        onSuccess: handleRequestChallengeSuccess,
        onError: (error: unknown) => {
          console.error(
            'Failed to initiate login challenge:',
            getErrorMessage(error),
          );
          showRequestErrorToast(error);
        },
      },
    );
  };

  const initiateChallenge = () => {
    if (!identifier) {
      console.error('No identifier found while initiating challenge');
      return;
    }

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
