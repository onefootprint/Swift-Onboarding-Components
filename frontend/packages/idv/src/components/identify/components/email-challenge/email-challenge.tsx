import { AuthMethodKind, ChallengeKind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useGetHeaderText from '../../hooks/use-get-header-text';
import { useIdentifyMachine } from '../../state';
import type { HeaderProps } from '../../types';
import { getDisplayEmail } from '../../utils/get-display-contact-info';
import PinVerification from '../pin-verification';

const IS_TEST = process.env.NODE_ENV === 'test';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

type EmailChallengeProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const EmailChallenge = ({ children, Header }: EmailChallengeProps) => {
  const { t } = useTranslation('identify');
  const [state, send] = useIdentifyMachine();
  const toast = useToast();
  const { identify, email } = state.context;
  const headerTitle = useGetHeaderText();
  const displayEmail = getDisplayEmail({ identify, email });
  const headerSubtitle = displayEmail ? (
    <span data-dd-privacy="mask">{t('email-challenge.prompt-with-email', { email: displayEmail })}</span>
  ) : (
    t('email-challenge.prompt-without-email')
  );

  const handleChallengeSucceed = (authToken: string) => {
    setTimeout(() => {
      send({
        type: 'challengeSucceeded',
        payload: { kind: AuthMethodKind.email, authToken },
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
      <Header data-dd-privacy="mask" title={headerTitle} subtitle={headerSubtitle} />
      <PinVerification
        onChallengeSucceed={handleChallengeSucceed}
        onNewChallengeRequested={handleNewChallengeRequested}
        preferredChallengeKind={ChallengeKind.email}
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

export default EmailChallenge;
