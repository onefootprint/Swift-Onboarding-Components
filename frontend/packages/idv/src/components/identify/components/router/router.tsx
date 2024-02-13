import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { NavigationHeaderLeftButtonProps } from '../../../layout';
import StepHeader from '../../../step-header';
import type { IdentifyMachineContext, IdentifyMachineHook } from '../../state';
import { useIdentifyMachine } from '../../state';
import type { DoneArgs, HeaderProps } from '../../types';
import getLeftNavButton from '../../utils/nav-left-btn';
import ChallengeSelectOrPasskey from '../challenge-select-or-passkey';
import EmailChallenge from '../email-challenge';
import InitAuthToken from '../init-auth-token';
import Loading from '../loading';
import Notification from '../notification';
import StepBootstrap from '../step-bootstrap';
import StepEmail from '../step-email';
import StepPhone from '../step-phone';
import StepSms from '../step-sms';

type Send = IdentifyMachineHook[1];
type RouterProps = {
  children?: (state: string, send: Send) => JSX.Element | null;
  onDone: (payload: DoneArgs) => void;
};

const getHeader = (
  ctx: IdentifyMachineContext,
  leftButton: NavigationHeaderLeftButtonProps,
): ((props: HeaderProps) => JSX.Element) =>
  function Header({ title, subtitle }): JSX.Element {
    return (
      <StepHeader
        leftButton={leftButton}
        logoUrl={ctx.logoConfig?.logoUrl}
        orgName={ctx.logoConfig?.orgName}
        showLogo={!!ctx.logoConfig}
        subtitle={subtitle}
        title={title}
      />
    );
  };

const Router = ({ onDone, children }: RouterProps): JSX.Element | null => {
  const [state, send] = useIdentifyMachine();
  const isDone = state.matches('success');
  const { t } = useTranslation('identify');
  const Header = getHeader(state.context, getLeftNavButton(state, send));

  const { initialAuthToken } = state.context;

  useEffect(() => {
    if (isDone && state.context.challenge.authToken) {
      onDone({ authToken: state.context.challenge.authToken });
    }
  }, [isDone, onDone]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isDone) return null;

  if (state.matches('init')) {
    return <Loading>{children?.('init', send)}</Loading>;
  }
  if (state.matches('initBootstrap')) {
    return <StepBootstrap>{children?.('initBootstrap', send)}</StepBootstrap>;
  }
  if (state.matches('initAuthToken') && initialAuthToken) {
    return (
      <InitAuthToken authToken={initialAuthToken}>
        {children?.('initBootstrap', send)}
      </InitAuthToken>
    );
  }
  if (state.matches('emailIdentification')) {
    return (
      <StepEmail Header={Header}>
        {children?.('emailIdentification', send)}
      </StepEmail>
    );
  }
  if (state.matches('phoneIdentification')) {
    return (
      <StepPhone Header={Header}>
        {children?.('phoneIdentification', send)}
      </StepPhone>
    );
  }
  if (state.matches('challengeSelectOrPasskey')) {
    return <ChallengeSelectOrPasskey Header={Header} />;
  }
  if (state.matches('smsChallenge')) {
    return (
      <StepSms Header={Header}>{children?.('smsChallenge', send)}</StepSms>
    );
  }
  if (state.matches('emailChallenge')) {
    return (
      <EmailChallenge Header={Header}>
        {children?.('emailChallenge', send)}
      </EmailChallenge>
    );
  }
  if (state.matches('authTokenInvalid')) {
    return (
      <Notification
        title={t('notification.404-user-title')}
        subtitle={t('notification.404-user-description')}
      />
    );
  }

  return null;
};

export default Router;
