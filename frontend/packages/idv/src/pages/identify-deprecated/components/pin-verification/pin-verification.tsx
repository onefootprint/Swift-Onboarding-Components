import { getErrorMessage, useRequestError } from '@onefootprint/request';
import type {
  ChallengeData,
  ChallengeKind,
  Identifier,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
  PhoneIdentifier,
  SignupChallengeResponse,
} from '@onefootprint/types';
import { IdentifyTokenScope } from '@onefootprint/types/src/api/identify-verify';
import { useToast } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import useIdentifyVerify from '../../../../hooks/api/hosted/identify/use-identify-verify';
import useLoginChallenge from '../../../../hooks/api/hosted/identify/use-login-challenge';
import useSignupChallenge from '../../../../hooks/api/hosted/identify/use-signup-challenge';
import useIdvRequestErrorToast from '../../../../hooks/ui/use-idv-request-error-toast';
import Logger from '../../../../utils/logger';
import { useIdentifyMachine } from '../machine-provider';
import Form from './components/form';

type PinVerificationProps = {
  title?: string;
  onChallengeSucceed: (authToken: string) => void;
  preferredChallengeKind: ChallengeKind;
  identifier: Identifier;
};

const getPhoneNumber = (
  identifier: Identifier,
  phoneNumber?: string,
): string | undefined =>
  'phoneNumber' in identifier ||
  !!(identifier as unknown as PhoneIdentifier).phoneNumber
    ? (identifier as PhoneIdentifier).phoneNumber
    : phoneNumber;

const PinVerification = ({
  title,
  onChallengeSucceed,
  preferredChallengeKind,
  identifier,
}: PinVerificationProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'identify.components.pin-verification',
  });
  const requestError = useRequestError();
  const [state, send] = useIdentifyMachine();
  const {
    identify: { email, sandboxId, userFound },
    challenge: { challengeData: data },
    obConfigAuth,
  } = state.context;
  const toast = useToast();
  const showRequestErrorToast = useIdvRequestErrorToast();

  const loginChallengeMutation = useLoginChallenge();
  const signupChallengeMutation = useSignupChallenge();
  const challengeData: ChallengeData | undefined =
    data ||
    loginChallengeMutation.data?.challengeData ||
    signupChallengeMutation.data?.challengeData;
  const identifyVerifyMutation = useIdentifyVerify();
  const isLoading =
    loginChallengeMutation.isLoading || signupChallengeMutation.isLoading;
  const isPending = isLoading || !challengeData;
  const isVerifying = identifyVerifyMutation.isLoading;

  const getIsSuccess = (): boolean => {
    if (!identifyVerifyMutation.isSuccess) {
      return false;
    }
    return userFound || 'email' in identifier || !!email;
  };

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerifyResponse) => {
    if (!authToken) {
      Logger.error(
        'Received empty auth token from successful challenge pin verification.',
        'pin-verification',
      );
      return;
    }

    onChallengeSucceed(authToken);
  };

  const verifyPin = (pin: string) => {
    if (!challengeData) {
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
        scope: IdentifyTokenScope.onboarding,
      },
      {
        onSuccess: handlePinValidationSucceeded,
        onError: (error: unknown) => {
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
      Logger.error(
        'Cannot initiate signup challenge challenge without obConfigAuth',
        'pin-verification',
      );
      return;
    }
    if ('authToken' in identifier) {
      Logger.error(
        'Cannot initiate signup challenge challenge with an authToken',
        'pin-verification',
      );
      return;
    }
    if (signupChallengeMutation.isLoading) {
      return;
    }

    const phoneNumber = getPhoneNumber(
      identifier,
      state.context.identify.phoneNumber,
    );

    signupChallengeMutation.mutate(
      {
        ...((email ? { email } : {}) as { email: string }),
        ...((phoneNumber ? { phoneNumber } : {}) as { phoneNumber: string }),
        obConfigAuth,
        sandboxId,
      },
      {
        onSuccess: handleRequestChallengeSuccess,
        onError: (error: unknown) => {
          if (requestError.getErrorCode(error) === 'E120') {
            Logger.error(
              'Entered signup challenge when the user already has a vault. Initiating login challenge',
              'pin-verification',
            );
            initiateLoginChallenge();
            return;
          }
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
      isSuccess={getIsSuccess()}
      hasError={identifyVerifyMutation.isError}
      onComplete={verifyPin}
      resendDisabledUntil={challengeData?.retryDisabledUntil}
      onResend={handleResend}
      isResendLoading={isLoading}
    />
  );
};

export default PinVerification;
