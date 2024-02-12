import styled, { css } from '@onefootprint/styled';
import { useToast } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import noop from 'lodash/fp/noop';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import useEffectOnceStrict from '../../hooks/use-effect-once-strict';
import type { UserChallengeBody, UserChallengeResponse } from '../../queries';
import { useUserChallenge, useUserChallengeVerify } from '../../queries';
import type { HeaderProps } from '../../types';
import shouldRequestNewChallenge from '../../utils/should-request-challenge';
import getErrorToastVariant from '../../utils/toast-error-variant';
import PinForm from '../pin-form';

type PartialPayload = 'kind' | 'email' | 'phoneNumber' | 'authToken';
type UpdateVerifyProps = {
  challengePayload: Pick<UserChallengeBody, PartialPayload>;
  Header: (props: HeaderProps) => JSX.Element;
  headerTitle: string;
  logError: (str: string, err?: unknown) => void;
  logWarn: (str: string, err?: unknown) => void;
  onChallengeVerificationSuccess: () => void;
};

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

const UpdateVerify = ({
  challengePayload,
  Header,
  headerTitle,
  logError,
  logWarn,
  onChallengeVerificationSuccess,
}: UpdateVerifyProps) => {
  const { authToken } = challengePayload;
  const { t } = useTranslation('identify');
  const toast = useToast();
  const mutUserChallenge = useUserChallenge({});
  const mutUserChallengeVerify = useUserChallengeVerify({});
  const [challengeData, setChallengeData] = useState<
    UserChallengeResponse | undefined
  >(undefined);
  const isChallengePending = mutUserChallenge.isLoading || !challengeData;

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
      onSuccess: setChallengeData,
    });
  };

  const handleOnPinInputCompletion = (formPin: string) => {
    if (!formPin) {
      logWarn('The PIN field cannot be left blank.');
      return;
    }
    if (!challengeData) {
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
        challengeToken: challengeData.challengeToken,
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
            description: t(
              `${challengePayload.kind}-update-success` as ParseKeys<'identify'>,
            ),
          });
          setTimeout(onChallengeVerificationSuccess, SUCCESS_EVENT_DELAY_MS);
        },
      },
    );
  };

  const handleOnResendClick = () => {
    const shouldResend = shouldRequestNewChallenge(
      challengeData,
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
        resendDisabledUntil={challengeData?.retryDisabledUntil}
        texts={{
          codeError: t('pin-verification.incorrect-code'),
          resendCountDown: t('pin-verification.resend-countdown'),
          resendCta: t('pin-verification.resend-cta'),
          success: t('pin-verification.success'),
          verifying: t('pin-verification.verifying'),
        }}
      />
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
