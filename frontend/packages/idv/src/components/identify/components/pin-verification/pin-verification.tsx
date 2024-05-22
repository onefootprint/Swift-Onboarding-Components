import { useRequestErrorToast } from '@onefootprint/hooks';
import { useRequestError } from '@onefootprint/request';
import type {
  ChallengeData,
  ChallengeKind,
  LoginChallengeResponse,
  SignupChallengeResponse,
} from '@onefootprint/types';
import type { ComponentProps } from 'react';
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
import getTokenScope from '../../utils/token-scope';
import PinForm from '../pin-form';

type PinFormProps = Pick<ComponentProps<typeof PinForm>, 'tryOtherAction'>;
type PinVerificationProps = {
  onChallengeSucceed: (authToken: string) => void;
  onNewChallengeRequested: () => void;
  preferredChallengeKind: ChallengeKind;
  title?: string;
} & PinFormProps;

const { logError, logWarn } = getLogger({ location: 'pin-verification' });

const PinVerification = ({
  onChallengeSucceed,
  onNewChallengeRequested,
  preferredChallengeKind,
  title,
  tryOtherAction,
}: PinVerificationProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    challenge: { challengeData: data },
    sandboxId,
    email,
    phoneNumber,
    identify: { identifyToken },
    variant,
    obConfigAuth,
    isComponentsSdk,
  } = state.context;
  const requestError = useRequestError();
  const { t } = useTranslation('identify', { keyPrefix: 'pin-verification' });
  const showRequestErrorToast = useRequestErrorToast();

  const scope = getTokenScope(variant);
  const mutLoginChallenge = useLoginChallenge();
  const mutSignupChallenge = useSignupChallenge({
    obConfigAuth,
    sandboxId,
    scope,
    isComponentsSdk,
  });
  const mutIdentifyVerify = useIdentifyVerify({ scope });

  const challengeData: ChallengeData | undefined =
    data ||
    mutLoginChallenge.data?.challengeData ||
    mutSignupChallenge.data?.challengeData;

  const isLoading = mutLoginChallenge.isLoading || mutSignupChallenge.isLoading;
  const isPending = isLoading || !challengeData;
  const isVerifying = mutIdentifyVerify.isLoading;

  const verifyPin = (pin: string) => {
    if (!challengeData) {
      logError('No challenge data found after completing pin');
      return;
    }

    if (mutIdentifyVerify.isLoading) {
      return;
    }

    const { challengeToken, token } = challengeData;
    mutIdentifyVerify.mutate(
      { challengeResponse: pin, challengeToken, authToken: token },
      {
        onError: error => {
          logWarn('Failed to verify pin: ', error);
          showRequestErrorToast(error);
        },
        onSuccess: ({ authToken }) => {
          onChallengeSucceed(authToken);
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
        phoneNumber,
      },
      {
        onError: (error: unknown) => {
          const isExistingVaultError =
            requestError.getErrorCode(error) === 'E120';
          const { token } = requestError.getErrorContext(error);
          if (isExistingVaultError && token) {
            logWarn(
              'Entered signup challenge when the user already has a vault. Initiating login challenge',
            );
            initiatePhoneOrEmailLoginChallenge(token);
            return;
          }
          logError('Failed to initiate signup challenge: ', error);
          showRequestErrorToast(error);
        },
        onSuccess: handleRequestChallengeSuccess,
      },
    );
  };

  const initiatePhoneOrEmailLoginChallenge = (authToken: string) => {
    if (mutLoginChallenge.isLoading) {
      return;
    }

    mutLoginChallenge.mutate(
      {
        authToken,
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

  const handleRequestChallenge = () => {
    const canSendNewRequest = shouldRequestNewChallenge(
      challengeData,
      preferredChallengeKind,
    );
    if (!canSendNewRequest) return;

    if (identifyToken) {
      initiatePhoneOrEmailLoginChallenge(identifyToken);
    } else {
      initiateSignupChallenge();
    }
  };

  useEffectOnceStrict(() => {
    handleRequestChallenge();
  });

  return (
    <PinForm
      hasError={mutIdentifyVerify.isError}
      isPending={isPending}
      isResendLoading={isLoading}
      isSuccess={mutIdentifyVerify.isSuccess}
      isVerifying={isVerifying}
      onComplete={verifyPin}
      onResend={handleRequestChallenge}
      resendDisabledUntil={challengeData?.retryDisabledUntil}
      title={title}
      tryOtherAction={tryOtherAction}
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
