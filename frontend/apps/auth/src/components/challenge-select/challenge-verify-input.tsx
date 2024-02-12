import styled, { css } from '@onefootprint/styled';
import type {
  ChallengeData,
  ChallengeKind,
  IdentifyVerifyResponse,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import noop from 'lodash/fp/noop';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useEffectOnceStrict } from '@/src/hooks';
import { useIdentifyVerify, useLoginChallenge } from '@/src/queries';
import { useUserMachine } from '@/src/state';
import type { HeaderProps } from '@/src/types';
import { getErrorToastVariant, shouldRequestNewChallenge } from '@/src/utils';

import PinForm from '../identify/components/pin-form';

type ChallengeVerifyInputProps = {
  challenge: ChallengeData | undefined;
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
  headerTitle: string;
  kind: `${ChallengeKind}`;
  logError: (str: string, err?: unknown) => void;
  logWarn: (str: string, err?: unknown) => void;
  onLoginChallengeSuccess: (data: ChallengeData) => void;
};

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

const ChallengeVerifyInput = ({
  challenge,
  children,
  Header,
  headerTitle,
  kind,
  logError,
  logWarn,
  onLoginChallengeSuccess,
}: ChallengeVerifyInputProps) => {
  const [state, send] = useUserMachine();
  const { authToken } = state.context;
  const { t } = useTranslation('common');
  const toast = useToast();
  const mutLoginChallenge = useLoginChallenge({});
  const mutIdentifyVerify = useIdentifyVerify({ authToken });
  const challengeData = challenge || mutLoginChallenge.data?.challengeData;
  const isChallengePending = mutLoginChallenge.isLoading || !challengeData;

  const handleRequestChallenge = (innerKind: `${ChallengeKind}`) => {
    if (!innerKind) {
      logError('Invalid challenge kind');
      throw new TypeError('Invalid challenge kind');
    }

    mutLoginChallenge.mutate(
      {
        authToken,
        isResend: Boolean(challengeData), // Check whether is resend, but isResend state might not have updated yet
        preferredChallengeKind: innerKind,
      },
      {
        onError: err => {
          toast.show(getErrorToastVariant(err));
          logError(`Failed to initiate ${innerKind} login challenge`, err);
        },
        onSuccess: res => {
          if (res.error) {
            toast.show(getErrorToastVariant(res.error));
            return;
          }

          if (res.challengeData.challengeKind !== innerKind) {
            logError('Received incorrect login challenge kind');
            return;
          }

          if (challengeData) {
            toast.show({
              title: t('pin-verification.success'),
              description: t('pin-verification.new-code-sent-description'),
            });
          }

          onLoginChallengeSuccess(res.challengeData);
        },
      },
    );
  };

  const handleOnPinInputCompletion = (pin: string) => {
    if (!pin) {
      logWarn('The PIN field cannot be left blank.');
      return;
    }
    if (!challengeData) {
      logWarn('No challenge data found after completing pin');
      return;
    }

    mutIdentifyVerify.mutate(
      { challengeResponse: pin, challengeToken: challengeData.challengeToken },
      {
        onError: error => {
          logWarn('Failed to verify pin', error);
          toast.show(getErrorToastVariant(error));
        },
        onSuccess: (res: IdentifyVerifyResponse) => {
          if (!res.authToken) {
            logError(
              'Received empty auth token from successful challenge pin verification.',
            );
            return;
          }

          setTimeout(() => {
            send({ type: 'setVerifyToken', payload: res.authToken });
          }, SUCCESS_EVENT_DELAY_MS);
        },
      },
    );
  };

  const handleOnResendClick = () => {
    if (!kind) return;
    const shouldResend = shouldRequestNewChallenge(challengeData, kind);
    if (shouldResend) {
      handleRequestChallenge(kind);
    }
  };

  useEffectOnceStrict(() => {
    if (kind) {
      handleRequestChallenge(kind);
    }
  });

  return (
    <Container>
      <Header data-private title={headerTitle} />
      <PinForm
        hasError={mutIdentifyVerify.isError}
        isPending={isChallengePending}
        isResendLoading={mutLoginChallenge.isLoading}
        isSuccess={mutIdentifyVerify.isSuccess}
        isVerifying={mutIdentifyVerify.isLoading}
        onComplete={
          mutIdentifyVerify.isLoading ? noop : handleOnPinInputCompletion
        }
        onResend={handleOnResendClick}
        resendDisabledUntil={challengeData?.retryDisabledUntil}
        texts={{
          codeError: t('pin-verification.incorrect-code'),
          resendCountDown: t('pin-verification.resend-countdown'),
          resendCta: t('pin-verification.resend-cta'),
          success: t('pin-verification.success'),
          verifying: t('pin-verification.verifying'),
        }}
      />
      {children}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[7]};
  `}
`;

export default ChallengeVerifyInput;
