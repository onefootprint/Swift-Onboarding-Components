import styled, { css } from '@onefootprint/styled';
import { useToast } from '@onefootprint/ui';
import noop from 'lodash/fp/noop';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useEffectOnceStrict } from '@/src/hooks';
import type { UserChallengeBody, UserChallengeResponse } from '@/src/queries';
import { useUserChallenge, useUserChallengeVerify } from '@/src/queries';
import type { HeaderProps } from '@/src/types';
import { getErrorToastVariant, shouldRequestNewChallenge } from '@/src/utils';

import PinForm from '../pin-form';

type PartialPayload = 'kind' | 'email' | 'phoneNumber' | 'authToken';
type UpdateVerifyProps = {
  challenge: UserChallengeResponse | undefined;
  challengePayload: Pick<UserChallengeBody, PartialPayload>;
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
  headerTitle: string;
  logError: (str: string, err?: unknown) => void;
  logWarn: (str: string, err?: unknown) => void;
  onChallengeSuccess: (data: UserChallengeResponse) => void;
  onChallengeVerificationSuccess: () => void;
};

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

const UpdateVerify = ({
  challenge,
  challengePayload,
  children,
  Header,
  headerTitle,
  logError,
  logWarn,
  onChallengeSuccess,
  onChallengeVerificationSuccess,
}: UpdateVerifyProps) => {
  const { authToken } = challengePayload;
  const { t } = useTranslation('common');
  const toast = useToast();
  const mutUserChallenge = useUserChallenge({});
  const mutUserChallengeVerify = useUserChallengeVerify({});
  const isChallengePending = mutUserChallenge.isLoading || !challenge;

  const handleRequestReplace = (payload: UserChallengeBody) => {
    if (!payload.kind) {
      logError('Invalid challenge kind');
      throw new TypeError('Invalid challenge kind');
    }
    if (!payload.authToken) {
      logError('Verify token not found');
      throw new TypeError('Verify token not found');
    }

    mutUserChallenge.mutate(payload, {
      onError: err => {
        logError(`Failed to initiate sms login challenge`, err);
        toast.show(getErrorToastVariant(err));
      },
      onSuccess: onChallengeSuccess,
    });
  };

  const handleOnPinInputCompletion = (formPin: string) => {
    if (!formPin) {
      logWarn('The PIN field cannot be left blank.');
      return;
    }
    if (!challenge) {
      logWarn('No challenge data found after completing pin');
      return;
    }
    if (!authToken) {
      logError('Verify token not found');
      throw new TypeError('Verify token not found');
    }

    mutUserChallengeVerify.mutate(
      {
        authToken,
        challengeToken: challenge.challengeToken,
        challengeResponse: formPin,
      },
      {
        onError: error => {
          logWarn('Failed to verify pin', error);
          toast.show(getErrorToastVariant(error));
        },
        onSuccess: () => {
          toast.show({
            title: t('success'),
            description: t(`${challengePayload.kind}-update-success`),
          });
          setTimeout(onChallengeVerificationSuccess, SUCCESS_EVENT_DELAY_MS);
        },
      },
    );
  };

  const handleOnResendClick = () => {
    const shouldResend = shouldRequestNewChallenge(
      challenge,
      challengePayload.kind,
    );
    if (shouldResend) {
      handleRequestReplace({ ...challengePayload, actionKind: 'replace' });
    }
  };

  useEffectOnceStrict(() => {
    handleRequestReplace({ ...challengePayload, actionKind: 'replace' });
  });

  return (
    <Container>
      <Header data-private title={headerTitle} />
      <PinForm
        hasError={mutUserChallengeVerify.isError}
        isPending={isChallengePending}
        isResendLoading={mutUserChallenge.isLoading}
        isSuccess={mutUserChallengeVerify.isSuccess}
        isVerifying={mutUserChallengeVerify.isLoading}
        onComplete={
          mutUserChallengeVerify.isLoading ? noop : handleOnPinInputCompletion
        }
        onResend={handleOnResendClick}
        resendDisabledUntil={challenge?.retryDisabledUntil}
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

export default UpdateVerify;
