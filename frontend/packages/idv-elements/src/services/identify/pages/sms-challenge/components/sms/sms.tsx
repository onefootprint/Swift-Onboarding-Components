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

import useIdentifyVerify from '../../../../../../hooks/api/hosted/identify/use-identify-verify';
import useLoginChallenge from '../../../../../../hooks/api/hosted/identify/use-login-challenge';
import useSignupChallenge from '../../../../../../hooks/api/hosted/identify/use-signup-challenge';
import useUserEmail from '../../../../../../hooks/api/hosted/user/use-user-email';
import useIdentifyMachine from '../../../../hooks/use-identify-machine';
import getScrubbedPhoneNumber from '../../../../utils/get-scrubbed-phone-number';
import Verification from './components/verification';

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 0 : 1500;

const Sms = () => {
  const { t } = useTranslation('pages.sms-challenge');
  const [state, send] = useIdentifyMachine();
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

  // Either scrub the phone number collected from the previous steps, or use the
  // challenge data scrubbed number
  const scrubbedPhoneNumber = getScrubbedPhoneNumber({
    successfulIdentifier,
    phoneNumber,
    challengeData,
  });
  // Sometimes, a new challenge may not have been re-generated upon mount because
  // of rate limiting (they recently sent a code), to avoid shifting the components
  // up and down, still show a generic title if we don't have the scrubbed phone number.
  // The user can always resend the code if they didn't already receive it.
  const title = scrubbedPhoneNumber
    ? t('prompt-with-phone', { scrubbedPhoneNumber })
    : t('prompt-without-phone');

  const complete = (authToken: string) => {
    setSuccess(true);
    setTimeout(() => {
      send({
        type: 'challengeSucceeded',
        payload: {
          authToken,
        },
      });
    }, SUCCESS_EVENT_DELAY_MS);
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

  const handleRequestChallengeSuccess = (payload: LoginChallengeResponse) => {
    if (payload.challengeData.challengeKind !== ChallengeKind.sms) {
      console.error(
        'Received biometric challenge after requesting login SMS challenge',
      );
      return;
    }

    setChallengeData(payload.challengeData);
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

  const resendSignupChallenge = () => {
    if (!phoneNumber) {
      console.error(
        'No phone number found while resending signup SMS challenge',
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
        onSuccess: payload => {
          toast.show({
            title: t('toast.success.title'),
            description: t('toast.success.description'),
          });
          handleRequestChallengeSuccess(payload);
        },
        onError: handleRequestError,
      },
    );
  };

  const resendLoginChallenge = () => {
    if (!successfulIdentifier) {
      console.error(
        'No successful identifier found while resending login SMS challenge',
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
        onSuccess: payload => {
          toast.show({
            title: t('toast.success.title'),
            description: t('toast.success.description'),
          });
          handleRequestChallengeSuccess(payload);
        },
        onError: handleRequestError,
      },
    );
  };

  const handleResend = () => {
    setResend(true);
    if (userFound) {
      resendLoginChallenge();
    } else {
      resendSignupChallenge();
    }
  };

  const handleRequestError = (error: unknown) => {
    showRequestErrorToast(error);
    console.error(error);
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

  useEffectOnce(() => {
    if (userFound) {
      initiateLoginChallenge();
    } else {
      initiateSignupChallenge();
    }
  });

  return (
    <Verification
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

export default Sms;
