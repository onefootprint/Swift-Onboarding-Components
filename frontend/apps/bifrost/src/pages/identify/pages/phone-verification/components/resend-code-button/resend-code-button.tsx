import {
  useIdentify,
  useIdentifyChallenge,
} from '@onefootprint/footprint-elements';
import {
  useCountdown,
  useRequestErrorToast,
  useTranslation,
} from '@onefootprint/hooks';
import { ChallengeKind, IdentifyResponse } from '@onefootprint/types';
import {
  LinkButton,
  LoadingIndicator,
  Typography,
  useToast,
} from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { Events } from 'src/utils/state-machine/identify/types';
import styled, { css } from 'styled-components';

import useIdentifyMachine from '../../../../hooks/use-identify-machine';

const ResendCodeButton = () => {
  const toast = useToast();
  const { t } = useTranslation('pages.phone-verification.form.resend-code');
  const [state, send] = useIdentifyMachine();
  const { phone, email, identifyType, challengeData } = state.context;
  const identifyChallengeMutation = useIdentifyChallenge();
  const identifyMutation = useIdentify();
  const showRequestErrorToast = useRequestErrorToast();
  const { setDate, countdown } = useCountdown();

  useEffect(() => {
    const retryDisabledUntil = challengeData?.retryDisabledUntil;
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

  const sendEmailIdentify = () => {
    if (!email) {
      return;
    }
    identifyMutation.mutate(
      {
        identifier: { email },
        preferredChallengeKind: ChallengeKind.sms,
        identifyType,
      },
      {
        onSuccess({ challengeData: newChallengedata }: IdentifyResponse) {
          if (!newChallengedata) {
            return;
          }
          const disabledUntil = newChallengedata.retryDisabledUntil;
          if (disabledUntil) {
            setDate(disabledUntil);
          }
          send({
            type: Events.smsChallengeResent,
            payload: {
              challengeData: newChallengedata,
            },
          });
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const handleResend = () => {
    // Depending on if the user's phone is known (if this is a new user who went
    // through the phone-registration page) handle resending differently
    if (phone) {
      sendIdentifyChallenge(phone);
    } else {
      sendEmailIdentify();
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
    row-gap: ${theme.spacing[4]};
    flex-direction: column;
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

export default ResendCodeButton;
