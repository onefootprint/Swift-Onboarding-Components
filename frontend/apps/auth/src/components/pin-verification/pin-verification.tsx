import { useRequestErrorToast } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type {
  ChallengeData,
  ChallengeKind,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
  SignupChallengeResponse,
} from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useEffectOnceStrict } from '@/src/hooks';
import {
  useIdentifyVerify,
  useLoginChallenge,
  useSignupChallenge,
} from '@/src/queries';
import { useAuthMachine } from '@/src/state';
import type { EmailAndOrPhone } from '@/src/types';
import { shouldRequestNewChallenge } from '@/src/utils';

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
    challenge: { challengeData: data },
    identify: { email, phoneNumber, sandboxId, userFound },
    obConfigAuth,
  } = state.context;
  const commonMutationProps = {
    authToken: state.context.authToken,
    obConfigAuth,
    sandboxId,
  };
  const { t } = useTranslation('common', {
    keyPrefix: 'auth.pin-verification',
  });
  const showRequestErrorToast = useRequestErrorToast();
  const mutLoginChallenge = useLoginChallenge(commonMutationProps);
  const mutSignupChallenge = useSignupChallenge(commonMutationProps);
  const mutIdentifyVerify = useIdentifyVerify(commonMutationProps);

  const challengeData: ChallengeData | undefined =
    data ||
    mutLoginChallenge.data?.challengeData ||
    mutSignupChallenge.data?.challengeData;

  const isLoading = mutLoginChallenge.isLoading || mutSignupChallenge.isLoading;
  const isPending = isLoading || !challengeData;
  const isVerifying = mutIdentifyVerify.isLoading;

  const isPinFormSuccess = (): boolean => {
    if (!mutIdentifyVerify.isSuccess) return false;
    return userFound || 'email' in identifier || !!email;
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

    if (mutIdentifyVerify.isLoading) {
      return;
    }

    const { challengeToken } = challengeData;
    mutIdentifyVerify.mutate(
      { challengeResponse: pin, challengeToken },
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
    if (mutSignupChallenge.isLoading) {
      return;
    }

    mutSignupChallenge.mutate(
      {
        email,
        phoneNumber: identifier?.phoneNumber || phoneNumber,
      },
      {
        onError: (error: unknown) => {
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
    if (mutLoginChallenge.isLoading) {
      return;
    }

    mutLoginChallenge.mutate(
      {
        identifier,
        isResend: !!challengeData, // Check whether is resend, but isResend state might not have updated yet
        preferredChallengeKind,
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

  const handleResend = () => {
    const shouldResend = shouldRequestNewChallenge(
      challengeData,
      preferredChallengeKind,
    );
    if (shouldResend) {
      initiateChallenge();
    }
  };

  useEffectOnceStrict(() => {
    // Initiate a challenge if there is no challenge data or it is stale
    const shouldInitiateChallenge = shouldRequestNewChallenge(
      challengeData,
      preferredChallengeKind,
    );
    if (shouldInitiateChallenge) {
      initiateChallenge();
    }
  });

  return (
    <PinForm
      hasError={mutIdentifyVerify.isError}
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
