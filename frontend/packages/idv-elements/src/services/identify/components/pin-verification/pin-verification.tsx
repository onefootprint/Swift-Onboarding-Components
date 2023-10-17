import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type {
  ChallengeData,
  ChallengeKind,
  Identifier,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
  SignupChallengeResponse,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useIdentifyVerify from '../../../../hooks/api/hosted/identify/use-identify-verify';
import useLoginChallenge from '../../../../hooks/api/hosted/identify/use-login-challenge';
import useSignupChallenge from '../../../../hooks/api/hosted/identify/use-signup-challenge';
import useUserEmail from '../../../../hooks/api/hosted/user/use-user-email';
import Logger from '../../../../utils/logger';
import { useIdentifyMachine } from '../machine-provider';
import Form from './components/form';

type PinVerificationProps = {
  title: string;
  onChallengeSucceed: (authToken: string) => void;
  preferredChallengeKind: ChallengeKind;
  identifier: Identifier;
};

const PinVerification = ({
  title,
  onChallengeSucceed,
  preferredChallengeKind,
  identifier,
}: PinVerificationProps) => {
  const { t } = useTranslation('components.pin-verification');
  const [state, send] = useIdentifyMachine();
  const {
    identify: { email, userFound, sandboxId },
    challenge: { challengeData: data },
    obConfigAuth,
  } = state.context;
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();

  const loginChallengeMutation = useLoginChallenge();
  const signupChallengeMutation = useSignupChallenge();
  const challengeData: ChallengeData | undefined =
    data ||
    loginChallengeMutation.data?.challengeData ||
    signupChallengeMutation.data?.challengeData;
  const identifyVerifyMutation = useIdentifyVerify();
  const userEmailMutation = useUserEmail();
  const [isSuccess, setSuccess] = useState(false);
  const isLoading =
    loginChallengeMutation.isLoading || signupChallengeMutation.isLoading;
  const isPending = isLoading || !challengeData;
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
      Logger.error(
        'Found empty email while sending registering email for new user',
        'pin-verification',
      );
      return;
    }

    if (userEmailMutation.isLoading) {
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
          Logger.error(
            `Failed email verification request: ${getErrorMessage(error)}`,
            'pin-verification',
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
      Logger.error(
        'Received empty auth token from successful challenge pin verification.',
        'pin-verification',
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
      Logger.error('No challenge data found after completing pin');
      return;
    }

    if (identifyVerifyMutation.isLoading) {
      return;
    }

    const { challengeToken } = challengeData;
    identifyVerifyMutation.mutate(
      {
        challengeResponse: pin,
        challengeToken,
        obConfigAuth,
        sandboxId,
        identifier,
      },
      {
        onSuccess: handlePinValidationSucceeded,
        onError: (error: unknown) => {
          console.warn('Failed to verify pin:', getErrorMessage(error));
          Logger.warn(`Failed to verify pin: ${getErrorMessage(error)}`);
          showRequestErrorToast(error);
        },
      },
    );
  };

  const handleRequestChallengeSuccess = (
    payload: LoginChallengeResponse | SignupChallengeResponse,
  ) => {
    // Check whether is resend, but isResend state might not have updated yet
    if (payload.error) {
      showRequestErrorToast(payload.error);
    } else if (challengeData) {
      toast.show({
        title: t('toast.success.title'),
        description: t('toast.success.description'),
      });
    }

    if (payload.challengeData.challengeKind !== preferredChallengeKind) {
      console.error('Received incorrect login challenge kind');
      Logger.error(
        'Received incorrect login challenge kind',
        'pin-verification',
      );
      return;
    }

    send({
      type: 'challengeReceived',
      payload: payload.challengeData,
    });
  };

  const initiateSignupChallenge = () => {
    if (!obConfigAuth) {
      console.error(
        'Cannot initiate signup challenge challenge without obConfigAuth',
      );
      Logger.error(
        'Cannot initiate signup challenge challenge without obConfigAuth',
        'pin-verification',
      );
      return;
    }
    if ('authToken' in identifier) {
      console.error(
        'Cannot initiate signup challenge challenge with an authToken',
      );
      Logger.error(
        'Cannot initiate signup challenge challenge with an authToken',
        'pin-verification',
      );
      return;
    }

    if (signupChallengeMutation.isLoading) {
      return;
    }

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
          Logger.error(
            `Failed to initiate signup challenge: ${getErrorMessage(error)}`,
            'pin-verification',
          );
          showRequestErrorToast(error);
        },
      },
    );
  };

  const initiateLoginChallenge = () => {
    if (loginChallengeMutation.isLoading) {
      return;
    }

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
          Logger.error(
            `Failed to initiate login challenge: ${getErrorMessage(error)}`,
            'pin-verification',
          );
          showRequestErrorToast(error);
        },
      },
    );
  };

  const initiateChallenge = () => {
    if (!identifier) {
      console.error('No identifier found while initiating challenge');
      Logger.error('No identifier found while initiating challenge');
      return;
    }

    if (userFound) {
      initiateLoginChallenge();
    } else {
      initiateSignupChallenge();
    }
  };

  const getShouldRequestNewChallenge = () => {
    const hasPreferredChallengeKind =
      challengeData?.challengeKind === preferredChallengeKind;
    if (!hasPreferredChallengeKind) {
      return true;
    }
    const isRetryDisabled =
      challengeData?.retryDisabledUntil &&
      challengeData.retryDisabledUntil > new Date();
    if (isRetryDisabled) {
      return false;
    }
    return true;
  };

  const handleResend = () => {
    const shouldResend = getShouldRequestNewChallenge();
    if (shouldResend) {
      initiateChallenge();
    }
  };

  useEffectOnce(() => {
    // Initiate a challenge if there is no challenge data or it is stale
    const shouldInitiateChallenge = getShouldRequestNewChallenge();
    if (shouldInitiateChallenge) {
      initiateChallenge();
    }
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
      isResendLoading={isLoading}
    />
  );
};

export default PinVerification;
