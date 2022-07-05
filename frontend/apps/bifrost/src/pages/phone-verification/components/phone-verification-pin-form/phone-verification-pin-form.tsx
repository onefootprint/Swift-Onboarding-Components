import { useTranslation } from 'hooks';
import React from 'react';
import useIdentify from 'src/hooks/identify/use-identify';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import useIdentifyVerification, {
  IdentifyVerificationResponse,
} from 'src/hooks/use-identify-verification';
import useOnboarding from 'src/hooks/use-onboarding';
import useUserData from 'src/hooks/use-user-data';
import { ChallengeKind } from 'src/utils/state-machine/types';
import { LinkButton, LoadingIndicator, PinInput } from 'ui';

const SUCCESS_EVENT_DELAY_MS = 1500;

type PhoneVerificationPinFormProps = {
  loadingComponent: () => JSX.Element;
  successComponent: () => JSX.Element;
};

const PhoneVerificationPinForm = ({
  loadingComponent: LoadingComponent,
  successComponent: SuccessComponent,
}: PhoneVerificationPinFormProps) => {
  const onboardingMutation = useOnboarding();
  const { t } = useTranslation('pages.phone-verification.form');
  const [state, send] = useBifrostMachine();
  const identifyMutation = useIdentify();
  const identifyVerificationMutation = useIdentifyVerification();
  const userDataMutation = useUserData();

  const startOnboarding = (tenantPk: string, authToken: string) => {
    onboardingMutation.mutate(
      { authToken, tenantPk },
      {
        onSuccess: ({ missingAttributes, missingWebauthnCredentials }) => {
          setTimeout(() => {
            send({
              type: Events.smsChallengeSucceeded,
              payload: {
                authToken,
                missingAttributes,
                missingWebauthnCredentials,
              },
            });
          }, SUCCESS_EVENT_DELAY_MS);
        },
      },
    );
  };

  const assignEmailAndStartOnboarding = (
    email: string,
    tenantPk: string,
    authToken: string,
  ) => {
    userDataMutation.mutate(
      { data: { email }, authToken },
      {
        onSuccess: () => {
          startOnboarding(tenantPk, authToken);
        },
      },
    );
  };

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerificationResponse) => {
    const { email, tenant } = state.context;
    const tenantPk = tenant.pk;
    assignEmailAndStartOnboarding(email, tenantPk, authToken);
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
    const { email } = state.context;
    identifyMutation.mutate(
      { identifier: { email }, preferredChallengeKind: ChallengeKind.sms },
      {
        onSuccess({ challengeData: newChallenge }) {
          if (!newChallenge) {
            return;
          }
          send({
            type: Events.smsChallengeResent,
            payload: {
              challengeData: newChallenge,
            },
          });
        },
      },
    );
  };

  if (onboardingMutation.isSuccess) {
    return <SuccessComponent />;
  }

  if (
    identifyVerificationMutation.isLoading ||
    userDataMutation.isLoading ||
    onboardingMutation.isLoading
  ) {
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
      {identifyMutation.isLoading ? (
        <LoadingIndicator />
      ) : (
        <LinkButton onClick={handleResend}>{t('resend-code.cta')}</LinkButton>
      )}
    </>
  );
};

export default PhoneVerificationPinForm;
