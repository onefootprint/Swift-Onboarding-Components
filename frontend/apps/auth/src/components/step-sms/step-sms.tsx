import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { ChallengeKind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import { useAuthMachine } from '@/src/state';
import type { HeaderProps } from '@/src/types';

import PinVerification from '../pin-verification';
import { getFormTitle, getStepTitle } from './utils';

type StepPhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

const StepSms = ({ children, Header }: StepPhoneProps) => {
  const [state, send] = useAuthMachine();
  const {
    challenge: { challengeData },
    identify,
  } = state.context;
  const { phoneNumber = '', successfulIdentifier } = identify;
  const { t } = useTranslation('auth');
  const toast = useToast();

  const headerTitle = getStepTitle(t, identify);
  const formTitle = getFormTitle(t, challengeData, identify);

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
      <Header data-private title={headerTitle} />
      <PinVerification
        identifier={successfulIdentifier ?? { phoneNumber }}
        onChallengeSucceed={handleChallengeSucceed}
        onNewChallengeRequested={handleNewChallengeRequested}
        preferredChallengeKind={ChallengeKind.sms}
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
    gap: ${theme.spacing[7]};
  `}
`;

export default StepSms;
