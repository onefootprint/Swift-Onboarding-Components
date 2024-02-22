import type {
  ChallengeData,
  Identifier as IdvIdentifier,
} from '@onefootprint/types';
import { ChallengeKind as Kind } from '@onefootprint/types';
import { AuthMethodKind } from '@onefootprint/types/src/data';
import { useToast } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { getScrubbedPhoneNumber } from '../../../../utils';
import useGetHeaderText from '../../hooks/use-get-header-text';
import useTryAnotherWay from '../../hooks/use-try-another-way';
import type { IdentifyResult } from '../../state';
import { useIdentifyMachine } from '../../state';
import type { HeaderProps } from '../../types';
import PinVerification from '../pin-verification';

type SmsChallengeProps = { Header: (props: HeaderProps) => JSX.Element };

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

const getFormTitle = (
  t: TFunction<'identify'>,
  challengeData: ChallengeData | undefined,
  identify: IdentifyResult,
): string => {
  const scrubbedPhoneNumber = getScrubbedPhoneNumber({
    challengeData,
    phoneNumber: identify.phoneNumber,
    successfulIdentifier: identify.successfulIdentifier as
      | IdvIdentifier
      | undefined,
  });

  return scrubbedPhoneNumber
    ? t('sms-challenge.prompt-with-phone', { scrubbedPhoneNumber })
    : t('sms-challenge.prompt-without-phone');
};

const SmsChallenge = ({ Header }: SmsChallengeProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    challenge: { challengeData },
    identify,
  } = state.context;
  const { phoneNumber = '', successfulIdentifier } = identify;
  const { t } = useTranslation('identify');
  const tryAnotherWay = useTryAnotherWay(t);
  const toast = useToast();
  const headerTitle = useGetHeaderText();
  const formTitle = getFormTitle(t, challengeData, identify);

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
      <Header data-private title={headerTitle} subtitle={formTitle} />
      <PinVerification
        identifier={successfulIdentifier ?? { phoneNumber }}
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
    > :first-child /* Header */ {
      margin-bottom: ${theme.spacing[8]};
    }
  `}
`;

export default SmsChallenge;
