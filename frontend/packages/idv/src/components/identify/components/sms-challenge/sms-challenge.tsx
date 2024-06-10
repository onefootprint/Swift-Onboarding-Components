import { AuthMethodKind, ChallengeKind as Kind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useGetHeaderText from '../../hooks/use-get-header-text';
import useTryAnotherWay from '../../hooks/use-try-another-way';
import { useIdentifyMachine } from '../../state';
import type { HeaderProps } from '../../types';
import { getDisplayPhone } from '../../utils/get-display-contact-info';
import PinVerification from '../pin-verification';

type SmsChallengeProps = { Header: (props: HeaderProps) => JSX.Element };

const IS_TEST = process.env.NODE_ENV === 'test';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

const SmsChallenge = ({ Header }: SmsChallengeProps) => {
  const [state, send] = useIdentifyMachine();
  const { phoneNumber, identify } = state.context;
  const { t } = useTranslation('identify');
  const tryAnotherWay = useTryAnotherWay(t);
  const toast = useToast();
  const headerTitle = useGetHeaderText();

  const displayPhone = getDisplayPhone({ identify, phoneNumber });

  const formTitle = displayPhone ? (
    <span data-private="true" data-dd-privacy="mask">
      {t('sms-challenge.prompt-with-phone', { phone: displayPhone })}
    </span>
  ) : (
    t('sms-challenge.prompt-without-phone')
  );

  const handleChallengeSucceed = (authToken: string) => {
    setTimeout(() => {
      send({
        type: 'challengeSucceeded',
        payload: { kind: AuthMethodKind.phone, authToken },
      });
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
      <Header title={headerTitle} subtitle={formTitle} />
      <PinVerification
        onChallengeSucceed={handleChallengeSucceed}
        onNewChallengeRequested={handleNewChallengeRequested}
        preferredChallengeKind={Kind.sms}
        tryOtherAction={tryAnotherWay}
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
    gap: ${theme.spacing[8]};
  `}
`;

export default SmsChallenge;
