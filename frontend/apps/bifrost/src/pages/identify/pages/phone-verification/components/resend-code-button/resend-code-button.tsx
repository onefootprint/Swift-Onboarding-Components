import { ChallengeKind, IdentifyResponse } from '@onefootprint/types';
import { useCountdown, useRequestErrorToast, useTranslation } from 'hooks';
import React, { useEffect } from 'react';
import useIdentify from 'src/pages/identify/hooks/use-identify';
import { Events } from 'src/utils/state-machine/identify/types';
import styled, { css } from 'styled-components';
import { LinkButton, LoadingIndicator, Typography, useToast } from 'ui';

import useIdentifyChallenge from '../../../../hooks/use-identify-challenge';
import useIdentifyMachine from '../../../../hooks/use-identify-machine';

const ResendCodeButton = () => {
  const toast = useToast();
  const { t } = useTranslation('pages.phone-verification.form.resend-code');
  const [state, send] = useIdentifyMachine();
  const identifyChallengeMutation = useIdentifyChallenge();
  const identifyMutation = useIdentify();
  const showRequestErrorToast = useRequestErrorToast();
  const { setDate, countdown } = useCountdown();

  useEffect(() => {
    const retryDisabledUntil = state.context.challengeData?.retryDisabledUntil;
    if (retryDisabledUntil) {
      setDate(retryDisabledUntil);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isResendLoading =
    identifyMutation.isLoading || identifyChallengeMutation.isLoading;

  if (isResendLoading) {
    return <LoadingIndicator />;
  }

  const sendIdentifyChallenge = (phoneNumber: string) => {
    const { identifyType } = state.context;
    identifyChallengeMutation.mutate(
      { phoneNumber, identifyType },
      {
        onError: showRequestErrorToast,
        onSuccess: ({
          challengeToken,
          retryDisabledUntil: challengeRetryDisabledUntil,
        }) => {
          if (challengeRetryDisabledUntil) {
            setDate(challengeRetryDisabledUntil);
          }
          toast.show({
            title: t('toast.success.title'),
            description: t('toast.success.description'),
          });
          send({
            type: Events.smsChallengeResent,
            payload: {
              challengeData: {
                challengeKind: ChallengeKind.sms,
                challengeToken,
                phoneNumberLastTwo: phoneNumber.slice(-2),
                retryDisabledUntil: challengeRetryDisabledUntil,
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
          const disabledUntil = challengeData.retryDisabledUntil;
          if (disabledUntil) {
            setDate(disabledUntil);
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

  return (
    <Container>
      <LinkButton disabled={countdown > 0} onClick={handleResend}>
        {t('cta')}
      </LinkButton>
      {countdown > 0 && (
        <Typography variant="body-4" color="tertiary">
          {t('disabled', { seconds: countdown })}{' '}
        </Typography>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    row-gap: ${theme.spacing[4]}px;
    flex-direction: column;
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

export default ResendCodeButton;
