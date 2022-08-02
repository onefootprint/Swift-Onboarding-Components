import { useRequestErrorToast, useTranslation } from 'hooks';
import React from 'react';
import useUserData from 'src/hooks/use-user-data';
import useIdentify, {
  IdentifyResponse,
} from 'src/pages/identify/hooks/use-identify';
import useIdentifyChallenge from 'src/pages/identify/hooks/use-identify-challenge';
import { ChallengeKind, Events } from 'src/utils/state-machine/identify/types';
import { LinkButton, LoadingIndicator, PinInput, useToast } from 'ui';

import useIdentifyMachine from '../../../../hooks/use-identify-machine';
import useIdentifyVerify, {
  IdentifyVerifyResponse,
} from '../../../../hooks/use-identity-verify';

const SUCCESS_EVENT_DELAY_MS = 1500;

type PhoneVerificationPinFormProps = {
  renderLoadingComponent: () => JSX.Element;
  renderSuccessComponent: () => JSX.Element;
};

const PhoneVerificationPinForm = ({
  renderLoadingComponent: LoadingComponent,
  renderSuccessComponent: SuccessComponent,
}: PhoneVerificationPinFormProps) => {
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const { t } = useTranslation('pages.phone-verification.form');

  const [state, send] = useIdentifyMachine();
  const identifyChallengeMutation = useIdentifyChallenge();
  const identifyMutation = useIdentify();
  const identifyVerifyMutation = useIdentifyVerify();
  const userDataMutation = useUserData();

  const shouldShowSuccess = identifyVerifyMutation.isSuccess;
  const shouldShowLoading =
    identifyVerifyMutation.isLoading || userDataMutation.isLoading;

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerifyResponse) => {
    const { email } = state.context;
    // Only send the user email to the backend if we are onboarding the user for
    // the first time
    if (!state.context.userFound) {
      userDataMutation.mutate({ data: { email }, authToken });
    }

    if (authToken) {
      setTimeout(() => {
        send({
          type: Events.smsChallengeSucceeded,
          payload: {
            authToken,
          },
        });
      }, SUCCESS_EVENT_DELAY_MS);
    }
  };

  const handlePinCompleted = (pin: string) => {
    const { challengeData } = state.context;
    if (!challengeData) {
      return;
    }
    const { challengeToken } = challengeData;
    identifyVerifyMutation.mutate(
      {
        challengeResponse: pin,
        challengeToken,
      },
      {
        onSuccess: handlePinValidationSucceeded,
      },
    );
  };

  const sendIdentifyChallenge = (phoneNumber: string) => {
    identifyChallengeMutation.mutate(
      {
        phoneNumber,
      },
      {
        onError: showRequestErrorToast,
        onSuccess: ({ challengeToken }) => {
          toast.show({
            title: t('resend-code.toast.success.title'),
            description: t('resend-code.toast.success.description'),
          });
          send({
            type: Events.smsChallengeResent,
            payload: {
              challengeData: {
                challengeKind: ChallengeKind.sms,
                challengeToken,
                phoneNumberLastTwo: phoneNumber.slice(-2),
              },
            },
          });
        },
      },
    );
  };

  const sendIdentify = (email: string) => {
    const { identifyType } = state.context;
    identifyMutation.mutate(
      {
        identifier: { email },
        preferredChallengeKind: ChallengeKind.sms,
        identifyType,
      },
      {
        onSuccess({ challengeData }: IdentifyResponse) {
          if (!challengeData) {
            return;
          }
          send({
            type: Events.smsChallengeResent,
            payload: {
              challengeData,
            },
          });
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const handleResend = () => {
    const { phone, email } = state.context;
    // Depending on if the user's phone is known (if this is a new user who went
    // through the phone-registration page) handle resending differently
    if (phone) {
      sendIdentifyChallenge(phone);
    } else {
      sendIdentify(email);
    }
  };

  if (shouldShowSuccess) {
    return <SuccessComponent />;
  }

  if (shouldShowLoading) {
    return <LoadingComponent />;
  }

  return (
    <>
      <PinInput
        onComplete={handlePinCompleted}
        hasError={identifyVerifyMutation.isError}
        hintText={
          identifyVerifyMutation.isError ? t('error.description') : undefined
        }
      />
      {identifyChallengeMutation.isLoading ? (
        <LoadingIndicator />
      ) : (
        <LinkButton onClick={handleResend}>{t('resend-code.cta')}</LinkButton>
      )}
    </>
  );
};

export default PhoneVerificationPinForm;
