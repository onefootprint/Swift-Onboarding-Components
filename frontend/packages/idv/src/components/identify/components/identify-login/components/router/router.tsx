import { UserChallengeActionKind } from '@onefootprint/types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { DoneArgs } from '@/idv/components/identify/identify.types';
import type { NavigationHeaderLeftButtonProps } from '../../../../../layout';
import StepHeader from '../../../../../step-header';
import DifferentAccountOption from '../../../different-account-option';
import Loading from '../../../loading';
import type { IdentifyMachineContext } from '../../state';
import { useIdentifyMachine } from '../../state';
import type { HeaderProps } from '../../types';
import getLeftNavButton from '../../utils/nav-left-btn';
import ChallengeSelectOrPasskey from '../challenge-select-or-passkey';
import EmailChallenge from '../email-challenge';
import InitAuthToken from '../init-auth-token';
import Notification from '../notification';
import PhoneKbaChallenge from '../phone-kba-challenge';
import SmsChallenge from '../sms-challenge';
import StepBootstrap from '../step-bootstrap';
import StepEmail from '../step-email';
import StepPhone from '../step-phone';
import { UpdateEmail, UpdatePhone } from '../user-update';

type RouterProps = { onDone: (payload: DoneArgs) => void; onBack?: () => void; handleReset?: () => void };

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

const Router = ({ onDone, onBack, handleReset }: RouterProps): JSX.Element | null => {
  const [state, send] = useIdentifyMachine();
  const { context, matches } = state;
  const { initialAuthToken, variant, challenge, email, phoneNumber } = context;
  const isDone = matches('success');
  const { t } = useTranslation('identify');
  const leftButton = getLeftNavButton(state, send, onBack);
  const Header = getHeader(context, leftButton);

  useEffect(() => {
    if (isDone && challenge.authToken) {
      onDone({
        authToken: challenge.authToken,
        phoneNumber,
        email,
        availableChallengeKinds: context.identify.user?.availableChallengeKinds,
      });
    }
  }, [isDone, onDone, challenge.authToken, email, phoneNumber]);

  if (isDone) return null;

  if (matches('init')) {
    return <Loading />;
  }
  // TODO: go through with rming this code to see what it's like
  // TODO: rm
  if (matches('initBootstrap')) {
    return <StepBootstrap />;
  }
  if (matches('initAuthToken') && initialAuthToken) {
    return <InitAuthToken authToken={initialAuthToken} />;
  }
  // TODO: rm
  if (matches('emailIdentification')) {
    return <StepEmail Header={Header} />;
  }
  // TODO: rm
  if (matches('phoneIdentification')) {
    return <StepPhone Header={Header} />;
  }

  const handleDifferentAccount = handleReset ?? (() => send({ type: 'loginWithDifferentAccount' }));
  const differentAccountOption = (
    <DifferentAccountOption
      onLoginWithDifferentAccount={handleDifferentAccount}
      orgId={context.config?.orgId || ''}
      isComponentsSdk={context.isComponentsSdk}
      hasBootstrapData={email?.isBootstrap || phoneNumber?.isBootstrap || false}
    />
  );

  if (matches('challengeSelectOrPasskey')) {
    return (
      <>
        <ChallengeSelectOrPasskey Header={Header} />
        {differentAccountOption}
      </>
    );
  }
  if (matches('smsChallenge')) {
    // TODO: remove signup challenge logic
    return (
      <>
        <SmsChallenge Header={Header} />
        {differentAccountOption}
      </>
    );
  }
  if (matches('emailChallenge')) {
    return (
      <>
        <EmailChallenge Header={Header} />
        {differentAccountOption}
      </>
    );
  }
  if (matches('phoneKbaChallenge')) {
    return <PhoneKbaChallenge Header={Header} />;
  }
  if (matches('addPhone') && challenge.authToken) {
    return (
      <UpdatePhone
        Header={Header}
        authToken={challenge.authToken}
        actionKind={UserChallengeActionKind.addPrimary}
        identifyVariant={variant}
        onSuccess={payload => send({ type: 'phoneAdded', payload })}
      />
    );
  }
  if (matches('addEmail') && challenge.authToken) {
    return (
      <UpdateEmail
        actionKind={UserChallengeActionKind.addPrimary}
        authToken={challenge.authToken}
        Header={Header}
        identifyVariant={variant}
        initialEmail={email?.value}
        onSuccess={payload => send({ type: 'emailAdded', payload })}
      />
    );
  }
  if (matches('authTokenInvalid')) {
    return <Notification title={t('notification.404-user-title')} subtitle={t('notification.404-user-description')} />;
  }
  if (matches('loginChallengeNotPossible')) {
    return (
      <Notification
        title={t('notification.404-auth-method-title')}
        subtitle={t('notification.404-auth-method-description')}
      />
    );
  }

  return null;
};

export default Router;
