import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { NavigationHeaderLeftButtonProps } from '../../../layout';
import StepHeader from '../../../step-header';
import { ActionKind } from '../../queries/use-user-challenge';
import type { IdentifyMachineContext } from '../../state';
import { useIdentifyMachine } from '../../state';
import type { DoneArgs, HeaderProps } from '../../types';
import getLeftNavButton from '../../utils/nav-left-btn';
import ChallengeSelectOrPasskey from '../challenge-select-or-passkey';
import DifferentAccountOption from '../different-account-option';
import EmailChallenge from '../email-challenge';
import InitAuthToken from '../init-auth-token';
import Loading from '../loading';
import Notification from '../notification';
import SmsChallenge from '../sms-challenge';
import StepBootstrap from '../step-bootstrap';
import StepEmail from '../step-email';
import StepPhone from '../step-phone';
import { UpdatePhone } from '../user-update';

type RouterProps = {
  onDone: (payload: DoneArgs) => void;
};

const getHeader = (
  ctx: IdentifyMachineContext,
  leftButton: NavigationHeaderLeftButtonProps,
): ((props: HeaderProps) => JSX.Element) =>
  function Header({ title, subtitle, overrideLeftButton }): JSX.Element {
    return (
      <StepHeader
        leftButton={overrideLeftButton || leftButton}
        logoUrl={ctx.logoConfig?.logoUrl}
        orgName={ctx.logoConfig?.orgName}
        showLogo={!!ctx.logoConfig}
        subtitle={subtitle}
        title={title}
      />
    );
  };

const Router = ({ onDone }: RouterProps): JSX.Element | null => {
  const [state, send] = useIdentifyMachine();
  const isDone = state.matches('success');
  const { t } = useTranslation('identify');
  const Header = getHeader(state.context, getLeftNavButton(state, send));

  const { initialAuthToken, variant } = state.context;

  useEffect(() => {
    if (isDone && state.context.challenge.authToken) {
      onDone({
        authToken: state.context.challenge.authToken,
        phoneNumber: state.context.identify.phoneNumber,
        email: state.context.identify.email,
      });
    }
  }, [isDone, onDone]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isDone) return null;

  if (state.matches('init')) {
    return <Loading />;
  }
  if (state.matches('initBootstrap')) {
    return <StepBootstrap />;
  }
  if (state.matches('initAuthToken') && initialAuthToken) {
    return <InitAuthToken authToken={initialAuthToken} />;
  }
  if (state.matches('emailIdentification')) {
    return <StepEmail Header={Header} />;
  }
  if (state.matches('phoneIdentification')) {
    return <StepPhone Header={Header} />;
  }
  if (state.matches('challengeSelectOrPasskey')) {
    return (
      <>
        <ChallengeSelectOrPasskey Header={Header} />
        <DifferentAccountOption />
      </>
    );
  }
  if (state.matches('smsChallenge')) {
    return (
      <>
        <SmsChallenge Header={Header} />
        <DifferentAccountOption />
      </>
    );
  }
  if (state.matches('emailChallenge')) {
    return (
      <>
        <EmailChallenge Header={Header} />
        <DifferentAccountOption />
      </>
    );
  }
  if (state.matches('addPhone') && state.context.challenge.authToken) {
    return (
      <UpdatePhone
        Header={Header}
        authToken={state.context.challenge.authToken}
        actionKind={ActionKind.addPrimary}
        identifyVariant={variant}
        onSuccess={phoneNumber => {
          send({ type: 'phoneAdded', payload: { phoneNumber } });
        }}
      />
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
