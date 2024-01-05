import type { NavigationHeaderLeftButtonProps } from '@onefootprint/idv-elements';
import { StepHeader } from '@onefootprint/idv-elements';
import React, { useEffect } from 'react';

import type { AuthMachineHook, MachineContext } from '../../state';
import { useAuthMachine } from '../../state';
import type { DoneArgs, HeaderProps } from '../../types';
import getHeaderLeftButton from '../../utils/get-header-left-btn';
import EmailChallenge from '../email-challenge';
import BaseLoading from '../loading/base-loading';
import PasskeyChallenge from '../passkey-challenge';
import StepBootstrap from '../step-bootstrap';
import StepEmail from '../step-email';
import StepPhone from '../step-phone';
import StepSms from '../step-sms';

type Send = AuthMachineHook[1];
type AuthRouteProps = {
  onDone: (payload: DoneArgs) => void;
  children?: (state: string, send: Send) => JSX.Element | null;
};

const getHeader = (
  ctx: MachineContext,
  leftButton: NavigationHeaderLeftButtonProps,
): ((props: HeaderProps) => JSX.Element) =>
  function Header({ title, subtitle }): JSX.Element {
    return (
      <StepHeader
        leftButton={leftButton}
        logoUrl={ctx.config.logoUrl ?? undefined}
        orgName={ctx.config.orgName}
        showLogo={ctx.showLogo}
        subtitle={subtitle}
        title={title}
      />
    );
  };

const AuthRouter = ({
  onDone,
  children,
}: AuthRouteProps): JSX.Element | null => {
  const [state, send] = useAuthMachine();
  const isDone = state.matches('success');
  const Header = getHeader(state.context, getHeaderLeftButton(state, send));

  useEffect(() => {
    if (isDone && state.context.challenge.authToken) {
      onDone({ authToken: state.context.challenge.authToken });
    }
  }, [isDone, onDone]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isDone) return null;

  if (state.matches('init')) {
    return <BaseLoading>{children?.('init', send)}</BaseLoading>;
  }
  if (state.matches('initBootstrap')) {
    return <StepBootstrap>{children?.('initBootstrap', send)}</StepBootstrap>;
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
  if (state.matches('smsChallenge')) {
    return (
      <StepSms Header={Header}>{children?.('smsChallenge', send)}</StepSms>
    );
  }
  if (state.matches('biometricChallenge')) {
    return (
      <PasskeyChallenge Header={Header}>
        {children?.('biometricChallenge', send)}
      </PasskeyChallenge>
    );
  }
  if (state.matches('emailChallenge')) {
    return (
      <EmailChallenge Header={Header}>
        {children?.('emailChallenge', send)}
      </EmailChallenge>
    );
  }

  return null;
};

export default AuthRouter;
