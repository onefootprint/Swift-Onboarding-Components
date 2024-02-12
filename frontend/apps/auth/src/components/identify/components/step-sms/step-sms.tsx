import { getScrubbedPhoneNumber } from '@onefootprint/idv';
import styled, { css } from '@onefootprint/styled';
import type { Identifier as IdvIdentifier } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useGetHeaderText from '../../hooks/use-get-header-text';
import { useIdentifyMachine } from '../../state';
import type { HeaderProps } from '../../types';
import PinVerification from '../pin-verification';

type StepPhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

const StepSms = ({ children, Header }: StepPhoneProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    challenge: { challengeData },
    identify,
  } = state.context;
  const { phoneNumber = '', successfulIdentifier } = identify;
  const { t } = useTranslation('common');
  const toast = useToast();
  const headerTitle = useGetHeaderText();

  const getFormTitle = (): string => {
    const scrubbedPhoneNumber = getScrubbedPhoneNumber({
      challengeData,
      phoneNumber: identify.phoneNumber,
      successfulIdentifier: identify.successfulIdentifier as
        | IdvIdentifier
        | undefined,
    });

    return scrubbedPhoneNumber
      ? t('sms-step.prompt-with-phone', { scrubbedPhoneNumber })
      : t('sms-step.prompt-without-phone');
  };
  const formTitle = getFormTitle();

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
