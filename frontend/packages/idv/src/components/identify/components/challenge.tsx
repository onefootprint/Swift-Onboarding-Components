import { getLogger } from '@/idv/utils/logger';
import {
  postHostedIdentifySessionChallengeMutation,
  postHostedIdentifySessionChallengeVerify,
} from '@onefootprint/axios';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { useRequestError } from '@onefootprint/request';
import type {
  ChallengeVerifyRequest,
  IdentifyRequirementChallenge,
  UserChallengeData,
} from '@onefootprint/request-types';
import { AuthMethodKind, ChallengeKind } from '@onefootprint/types/src/data';
import { Stack, useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Context } from '../identify.types';
import getHeader from '../utils/get-header';
import DifferentAccountOption from './different-account-option';
import PinForm from './identify-login/components/pin-form';
import calculateRetryTime from './identify-login/queries/get-retry-time';

const IS_TEST = process.env.NODE_ENV === 'test';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 10 : 1500;

const { logError, logWarn } = getLogger({ location: 'step-challenge' });

type ChallengeProps = {
  context: Context;
  requirement: IdentifyRequirementChallenge;
  onDone: (delayMs?: number) => Promise<void>;
  onReset: () => void;
  // State for the challenge is managed by the parent component so we can save the challenge data even after
  // clicking the back button
  setChallengeData: (challengeData: UserChallengeData | undefined) => void;
};

const challengeKindForAuthMethod: Record<AuthMethodKind, ChallengeKind> = {
  [AuthMethodKind.email]: ChallengeKind.email,
  [AuthMethodKind.phone]: ChallengeKind.sms,
  [AuthMethodKind.passkey]: ChallengeKind.biometric,
};

const Challenge = ({ context, requirement, onDone, onReset, setChallengeData }: ChallengeProps) => {
  const {
    state: { identifyToken, phoneNumber, email, challengeData },
    initArgs: { logoConfig, isComponentsSdk, config },
    onPrev,
  } = context;
  const { t } = useTranslation('identify');
  const { getErrorCode } = useRequestError();

  const headers = { headers: { 'X-Fp-Authorization': identifyToken } };
  const challengeMutation = useMutation({
    ...postHostedIdentifySessionChallengeMutation(headers),
    onError: error => {
      const isExistingVaultError = getErrorCode(error) === 'E120';
      if (isExistingVaultError) {
        logWarn('Entered signup challenge when the user already has a vault. Initiating login challenge');
        // Don't complete the challenge - just proceed to refresh requirements, which should now show a login requirement.
        return onDone();
      }
      logError('Error while requesting challenge:', error);
      showRequestErrorToast(error);
    },
  });
  const verifyMutation = useMutation({
    mutationFn: async (body: ChallengeVerifyRequest) => {
      await postHostedIdentifySessionChallengeVerify({
        headers: { 'X-Fp-Authorization': identifyToken },
        body,
        throwOnError: true,
      });
      await onDone(SUCCESS_EVENT_DELAY_MS);
    },
    onError: error => {
      logError('Error while verifying challenge:', error);
      showRequestErrorToast(error);
    },
  });
  const showRequestErrorToast = useRequestErrorToast();
  const toast = useToast();

  const challengeKind = challengeKindForAuthMethod[requirement.authMethod];

  const handleRequestChallenge = () => {
    challengeMutation.mutate(
      { body: { challengeKind } },
      {
        onSuccess: data => {
          if (data.error) {
            logError('Error while requesting challenge:', data.error);
            showRequestErrorToast(data.error);
            return;
          }

          if (challengeData) {
            // This is a resend, show a toast
            toast.show({
              title: t('pin-verification.success'),
              description: t('pin-verification.new-code-sent-description'),
            });
          }
          setChallengeData(data.challengeData);
        },
      },
    );
  };

  useEffect(() => {
    if (!challengeData) {
      handleRequestChallenge();
    }
  }, [challengeData]);

  const handleVerifyPin = (pin: string) => {
    if (!challengeData) {
      logError('No challenge data found after completing pin');
      return;
    }

    verifyMutation.mutate({ challengeResponse: pin, challengeToken: challengeData.challengeToken });
  };

  let headerTitle;
  let formTitle;
  if (requirement.authMethod === 'email') {
    headerTitle = t('email-challenge.verify-title');
    formTitle = (
      <span data-dd-privacy="mask" data-dd-action-name="Subtitle with email">
        {t('email-challenge.prompt-with-email', { email: email?.value })}
      </span>
    );
  } else if (requirement.authMethod === 'phone') {
    headerTitle = t('sms-challenge.verify-title');
    formTitle = (
      <span data-dd-privacy="mask" data-dd-action-name="Subtitle with phone">
        {t('sms-challenge.prompt-with-phone', { phone: phoneNumber?.value })}
      </span>
    );
  }

  const Header = getHeader(logoConfig, onPrev);
  const retryDisabledUntil = calculateRetryTime(challengeData?.timeBeforeRetryS ?? 0);

  return (
    <>
      <Stack direction="column" align="center" justify="center" gap={8}>
        <Header title={headerTitle} subtitle={formTitle} />
        <PinForm
          hasError={verifyMutation.isError}
          isPending={challengeMutation.isPending || !challengeData}
          isResendLoading={verifyMutation.isPending}
          isSuccess={verifyMutation.isSuccess}
          isVerifying={verifyMutation.isPending}
          onComplete={handleVerifyPin}
          onResend={handleRequestChallenge}
          resendDisabledUntil={retryDisabledUntil}
          texts={{
            codeError: t('pin-verification.incorrect-code'),
            resendCountDown: t('pin-verification.resend-countdown'),
            resendCta: t('pin-verification.resend-cta'),
            success: t('pin-verification.success'),
            verifying: t('pin-verification.verifying'),
          }}
        />
      </Stack>
      <DifferentAccountOption
        onLoginWithDifferentAccount={onReset}
        orgId={config?.orgId || ''}
        isComponentsSdk={isComponentsSdk || false}
        hasBootstrapData={email?.isBootstrap || phoneNumber?.isBootstrap || false}
      />
    </>
  );
};

export default Challenge;
