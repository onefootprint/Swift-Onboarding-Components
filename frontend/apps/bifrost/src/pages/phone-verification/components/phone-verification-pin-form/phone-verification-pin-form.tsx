import { useRequestErrorToast, useTranslation } from 'hooks';
import React from 'react';
import useIdentifyChallenge from 'src/hooks/identify/use-identify-challenge';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import useIdentifyVerification, {
  IdentifyVerificationResponse,
} from 'src/hooks/use-identify-verification';
import useUserData from 'src/hooks/use-user-data';
import { ChallengeKind } from 'src/utils/state-machine/types';
import { LinkButton, LoadingIndicator, PinInput, useToast } from 'ui';

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

  const [state, send] = useBifrostMachine();
  const identifyChallengeMutation = useIdentifyChallenge();
  const identifyVerificationMutation = useIdentifyVerification();
  const userDataMutation = useUserData();

  const shouldShowSuccess = identifyVerificationMutation.isSuccess;
  const shouldShowLoading =
    identifyVerificationMutation.isLoading || userDataMutation.isLoading;

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerificationResponse) => {
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
    const { challenge } = state.context;
    if (!challenge) {
      return;
    }
    const { challengeToken, challengeKind } = challenge;
    identifyVerificationMutation.mutate(
      {
        challengeKind,
        challengeResponse: pin,
        challengeToken,
      },
      {
        onSuccess: handlePinValidationSucceeded,
      },
    );
  };

  const handleResend = () => {
    const { phone: phoneNumber } = state.context;
    if (phoneNumber) {
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
        hasError={identifyVerificationMutation.isError}
        hintText={
          identifyVerificationMutation.isError
            ? t('error.description')
            : undefined
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
