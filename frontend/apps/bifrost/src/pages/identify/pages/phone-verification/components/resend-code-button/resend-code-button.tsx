import {
  useLoginChallenge,
  useSignupChallenge,
} from '@onefootprint/footprint-elements';
import {
  useCountdown,
  useRequestErrorToast,
  useTranslation,
} from '@onefootprint/hooks';
import { ChallengeKind } from '@onefootprint/types';
import { ChallengeData } from '@onefootprint/types/src/data/challenge-data';
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
  const { phone, email, identifyType, challengeData, userFound } =
    state.context;
  const loginChallengeMutation = useLoginChallenge();
  const signupChallengeMutation = useSignupChallenge();
  const showRequestErrorToast = useRequestErrorToast();
  const { setDate, countdown } = useCountdown();

  useEffect(() => {
    const retryDisabledUntil = challengeData?.retryDisabledUntil;
    if (retryDisabledUntil) {
      setDate(retryDisabledUntil);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isResendLoading = loginChallengeMutation.isLoading;

  if (isResendLoading) {
    return <LoadingIndicator />;
  }

  const handleChallengeResendSuccess = (newChallengeData: ChallengeData) => {
    const { retryDisabledUntil } = newChallengeData;
    if (retryDisabledUntil) {
      setDate(retryDisabledUntil);
    }
    toast.show({
      title: t('toast.success.title'),
      description: t('toast.success.description'),
    });
    send({
      type: Events.smsChallengeResent,
      payload: {
        challengeData: newChallengeData,
      },
    });
  };

  const requestSignupChallenge = (phoneNumber: string) => {
    signupChallengeMutation.mutate(
      {
        phoneNumber,
        identifyType,
      },
      {
        onSuccess: ({ challengeData: newChallengeData }) => {
          handleChallengeResendSuccess(newChallengeData);
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const requestLoginChallenge = () => {
    if (!email) {
      return;
    }
    loginChallengeMutation.mutate(
      {
        identifier: { email },
        preferredChallengeKind: ChallengeKind.sms,
        identifyType,
      },
      {
        onSuccess({ challengeData: newChallengeData }) {
          handleChallengeResendSuccess(newChallengeData);
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const handleResend = () => {
    // Depending on if the user's phone is known (if this is a new user who went
    // through the phone-registration page) handle resending differently
    if (userFound) {
      requestLoginChallenge();
    } else if (phone) {
      requestSignupChallenge(phone);
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
