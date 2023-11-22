import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type {
  ChallengeData,
  ChallengeKind,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
  SignupChallengeResponse,
} from '@onefootprint/types';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import {
  useIdentifyVerify,
  useLoginChallenge,
  useSignupChallenge,
} from '../../hooks';
import { useAuthMachine } from '../../state';
import type { EmailAndOrPhone } from '../../types';
import PinForm from '../pin-form';

type PinVerificationProps = {
  identifier: EmailAndOrPhone;
  onChallengeSucceed: (authToken: string) => void;
  onNewChallengeRequested: () => void;
  preferredChallengeKind: ChallengeKind;
  title: string;
};

const PinVerification = ({
  identifier,
  onChallengeSucceed,
  onNewChallengeRequested,
  preferredChallengeKind,
  title,
}: PinVerificationProps) => {
  const [state, send] = useAuthMachine();
  const {
    identify: { email, phoneNumber, sandboxId, userFound },
    challenge: { challengeData: data },
    obConfigAuth,
  } = state.context;
  const { t } = useTranslation('pages.auth.pin-verification');
  const showRequestErrorToast = useRequestErrorToast();
  const loginChallengeMutation = useLoginChallenge();
  const signupChallengeMutation = useSignupChallenge();
  const identifyVerifyMutation = useIdentifyVerify();

  const challengeData: ChallengeData | undefined =
    data ||
    loginChallengeMutation.data?.challengeData ||
    signupChallengeMutation.data?.challengeData;

  const isLoading =
    loginChallengeMutation.isLoading || signupChallengeMutation.isLoading;

  const isPending = isLoading || !challengeData;
  const isVerifying = identifyVerifyMutation.isLoading;

  const isPinFormSuccess = (): boolean => {
    if (!identifyVerifyMutation.isSuccess) return false;
    return userFound || Object.hasOwn(identifier, 'email') || Boolean(email);
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

    onChallengeSucceed(authToken);
  };

  const verifyPin = (pin: string) => {
    if (!challengeData) {
      console.error('No challenge data found after completing pin');
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
      },
      {
        onError: error => {
          console.warn(`Failed to verify pin: ${getErrorMessage(error)}`);
          showRequestErrorToast(error);
        },
        onSuccess: handlePinValidationSucceeded,
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
      onNewChallengeRequested();
    }

    if (payload.challengeData.challengeKind !== preferredChallengeKind) {
      console.error('Received incorrect login challenge kind');
      return;
    }

    send({ type: 'challengeReceived', payload: payload.challengeData });
  };

  const initiateSignupChallenge = () => {
    if (!obConfigAuth) {
      console.error(
        'Cannot initiate signup challenge challenge without obConfigAuth',
      );
      return;
    }

    if (signupChallengeMutation.isLoading) {
      return;
    }

    signupChallengeMutation.mutate(
      {
        email,
        phoneNumber: identifier?.phoneNumber || phoneNumber,
        obConfigAuth,
        sandboxId,
      },
      {
        onError: error => {
          console.error(
            `Failed to initiate signup challenge: ${getErrorMessage(error)}`,
          );
          showRequestErrorToast(error);
        },
        onSuccess: handleRequestChallengeSuccess,
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
        isResend: !!challengeData, // Check whether is resend, but isResend state might not have updated yet
        obConfigAuth,
        preferredChallengeKind,
        sandboxId,
      },
      {
        onError: error => {
          console.error(
            `Failed to initiate login challenge: ${getErrorMessage(error)}`,
          );
          showRequestErrorToast(error);
        },
        onSuccess: handleRequestChallengeSuccess,
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
    <PinForm
      hasError={identifyVerifyMutation.isError}
      isPending={isPending}
      isResendLoading={isLoading}
      isSuccess={isPinFormSuccess()}
      isVerifying={isVerifying}
      onComplete={verifyPin}
      onResend={handleResend}
      resendDisabledUntil={challengeData?.retryDisabledUntil}
      title={title}
      texts={{
        codeError: t('incorrect-code'),
        resendCountDown: t('resend-countdown'),
        resendCta: t('resend-cta'),
        success: t('success'),
        verifying: t('verifying'),
      }}
    />
  );
};

export default PinVerification;
