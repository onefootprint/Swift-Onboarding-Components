import styled, { css } from '@onefootprint/styled';
import { ChallengeKind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthMachine } from '../../state';
import type { HeaderProps } from '../../types';
import PinVerification from '../pin-verification';

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

type EmailChallengeProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const EmailChallenge = ({ children, Header }: EmailChallengeProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.auth',
  });
  const [state, send] = useAuthMachine();
  const toast = useToast();
  const {
    identify: { userFound, email = '', isUnverified, successfulIdentifier },
  } = state.context;
  const shouldShowWelcomeBack = userFound && !isUnverified;
  const title = shouldShowWelcomeBack
    ? t('email-challenge.welcome-back-title')
    : t('email-challenge.title');

  // If we enter the email challenge via an auth token identifier, we won't have an email to display
  const formTitle = email
    ? t('email-challenge.prompt-with-email', { email })
    : t('email-challenge.prompt-without-email');

  const handleChallengeSucceed = (authToken: string) => {
    setTimeout(() => {
      send({ type: 'challengeSucceeded', payload: { authToken } });
    }, SUCCESS_EVENT_DELAY_MS);
  };

  const handleNewChallengeRequested = () => {
    toast.show({
      title: t('pin-verification.success'),
      description: t('pin-verification.new-code-sent-description'),
    });
  };

  return (
    <Container>
      <Header title={title} />
      <PinVerification
        identifier={successfulIdentifier ?? { email }}
        onChallengeSucceed={handleChallengeSucceed}
        onNewChallengeRequested={handleNewChallengeRequested}
        preferredChallengeKind={ChallengeKind.email}
        title={formTitle}
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
    gap: ${theme.spacing[3]};
  `}
`;

export default EmailChallenge;
