import {
  useIdentifyVerify,
  useUserEmail,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IdentifyVerifyResponse } from '@onefootprint/types';
import { PinInput } from '@onefootprint/ui';
import React from 'react';
import { Events } from 'src/utils/state-machine/identify/types';

import useIdentifyMachine from '../../../../hooks/use-identify-machine';
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
  const userEmailMutation = useUserEmail();

  const shouldShowSuccess = identifyVerifyMutation.isSuccess;
  const shouldShowLoading =
    identifyVerifyMutation.isLoading || userEmailMutation.isLoading;

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerifyResponse) => {
    const { email } = state.context;
    // Only send the user email to the backend if we are onboarding the user for
    // the first time
    if (!state.context.userFound) {
      userEmailMutation.mutate({ data: { email }, authToken });
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
        hint={
          identifyVerifyMutation.isError ? t('error.description') : undefined
        }
      />
      <ResendCodeButton />
    </>
  );
};

export default PhoneVerificationPinForm;
