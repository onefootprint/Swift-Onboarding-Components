import { useRequestErrorToast } from '@onefootprint/hooks';
import { useRequestError } from '@onefootprint/request';
import type {
  ChallengeData,
  ChallengeKind,
  Identifier,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
  SignupChallengeResponse,
} from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getLogger } from '../../../../utils';
import useEffectOnceStrict from '../../hooks/use-effect-once-strict';
import {
  useIdentifyVerify,
  useLoginChallenge,
  useSignupChallenge,
} from '../../queries';
import { useIdentifyMachine } from '../../state';
import shouldRequestNewChallenge from '../../utils/should-request-challenge';
import PinForm from '../pin-form';

type PinVerificationProps = {
  identifier: Identifier;
  onChallengeSucceed: (authToken: string) => void;
  onNewChallengeRequested: () => void;
  preferredChallengeKind: ChallengeKind;
  title?: string;
};

const { logError } = getLogger('pin-verification');

const PinVerification = ({
  identifier,
  onChallengeSucceed,
  onNewChallengeRequested,
  preferredChallengeKind,
  title,
}: PinVerificationProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    challenge: { challengeData: data },
    identify: { email, phoneNumber, sandboxId, user },
    obConfigAuth,
  } = state.context;
  const commonMutationProps = {
    authToken: state.context.initialAuthToken,
    obConfigAuth,
    sandboxId,
  };
  const requestError = useRequestError();
  const { t } = useTranslation('identify', {
    keyPrefix: 'pin-verification',
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

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerifyResponse) => {
    onChallengeSucceed(authToken);
  };

  const verifyPin = (pin: string) => {
    if (!challengeData) {
      logError('No challenge data found after completing pin');
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
          logError('Failed to verify pin: ', error);
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
      logError('Received incorrect login challenge kind');
      return;
    }

    send({ type: 'challengeReceived', payload: payload.challengeData });
  };

  const initiateSignupChallenge = () => {
    if (!obConfigAuth) {
      logError(
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
        phoneNumber:
          ('phoneNumber' in identifier ? identifier.phoneNumber : undefined) ||
          phoneNumber,
      },
      {
        onError: (error: unknown) => {
          if (requestError.getErrorCode(error) === 'E120') {
            logError(
              'Entered signup challenge when the user already has a vault. Initiating login challenge',
            );
            initiateLoginChallenge();
            return;
          }
          logError('Failed to initiate signup challenge: ', error);
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

    // We'll be able to simplify this soon with the token-based login challenges
    const loginIdentifier =
      'email' in identifier || 'phoneNumber' in identifier
        ? identifier
        : undefined;
    mutLoginChallenge.mutate(
      {
        identifier: loginIdentifier,
        isResend: !!challengeData, // Check whether is resend, but isResend state might not have updated yet
        preferredChallengeKind,
      },
      {
        onError: error => {
          logError('Failed to initiate login challenge:', error);
          showRequestErrorToast(error);
        },
        onSuccess: handleRequestChallengeSuccess,
      },
    );
  };

  const initiateChallenge = () => {
    if (!identifier) {
      logError('No identifier found while initiating challenge');
      return;
    }

    if (user) {
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
      isSuccess={mutIdentifyVerify.isSuccess}
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
