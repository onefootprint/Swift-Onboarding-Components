import { useRequestErrorToast, useTranslation } from 'hooks';
import React from 'react';
import useUserData from 'src/hooks/use-user-data';
import { Events } from 'src/utils/state-machine/identify/types';
import { PinInput } from 'ui';

import useIdentifyMachine from '../../../../hooks/use-identify-machine';
import useIdentifyVerify, {
  IdentifyVerifyResponse,
} from '../../../../hooks/use-identify-verify';
import ResendCodeButton from '../resend-code-button/resend-code-button';

const SUCCESS_EVENT_DELAY_MS = 1500;

type PhoneVerificationPinFormProps = {
  renderLoadingComponent: () => JSX.Element;
  renderSuccessComponent: () => JSX.Element;
};

const PhoneVerificationPinForm = ({
  renderLoadingComponent: LoadingComponent,
  renderSuccessComponent: SuccessComponent,
}: PhoneVerificationPinFormProps) => {
  const showRequestErrorToast = useRequestErrorToast();
  const { t } = useTranslation('pages.phone-verification.form');

  const [state, send] = useIdentifyMachine();
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
        onError: showRequestErrorToast,
      },
    );
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
      <ResendCodeButton />
    </>
  );
};

export default PhoneVerificationPinForm;
