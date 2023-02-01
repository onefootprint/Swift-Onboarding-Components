import {
  useIdentifyVerify,
  useUserEmail,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IdentifyVerifyResponse } from '@onefootprint/types';
import { PinInput } from '@onefootprint/ui';
import React, { useState } from 'react';
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
  const [shouldShowSuccess, setShouldShowSuccess] = useState(false);
  const { email, userFound, challengeData, tenantPk } = state.context;
  const identifyVerifyMutation = useIdentifyVerify();
  const userEmailMutation = useUserEmail();
  const shouldShowLoading =
    identifyVerifyMutation.isLoading || userEmailMutation.isLoading;

  const delayedSuccessTransition = (authToken: string) => {
    setShouldShowSuccess(true);
    setTimeout(() => {
      send({
        type: Events.smsChallengeSucceeded,
        payload: {
          authToken,
        },
      });
    }, SUCCESS_EVENT_DELAY_MS);
  };

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerifyResponse) => {
    // Only send the user email to the backend if we are onboarding the user for
    // the first time
    if (!authToken) {
      console.error(
        'Received empty auth token from successful sms pin verification.',
      );
      return;
    }

    if (userFound) {
      delayedSuccessTransition(authToken);
      return;
    }

    if (!email) {
      // If no email is found, we will let collect-kyc-data machine collect a new email &
      // send a verification email.
      console.error(
        'Found empty email while trying to send verification email.',
      );
      delayedSuccessTransition(authToken);
      return;
    }

    userEmailMutation.mutate(
      { data: { email }, authToken },
      {
        onSuccess: () => {
          delayedSuccessTransition(authToken);
        },
        onError: (error: unknown) => {
          showRequestErrorToast(error);
          console.error('Failed email verification request: ', error);
        },
      },
    );
  };

  const handlePinCompleted = (pin: string) => {
    if (!challengeData) {
      return;
    }
    const { challengeToken } = challengeData;
    identifyVerifyMutation.mutate(
      {
        challengeResponse: pin,
        challengeToken,
        tenantPk,
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
