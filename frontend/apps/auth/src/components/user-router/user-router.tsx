import { useTranslation } from '@onefootprint/hooks';
import type { NavigationHeaderLeftButtonProps } from '@onefootprint/idv';
import { StepHeader } from '@onefootprint/idv';
import React from 'react';

import type { UserMachineContext } from '@/src/state';
import { useUserMachine } from '@/src/state';
import type { HeaderProps } from '@/src/types';
import { getUserLeftNavButton } from '@/src/utils';

import Loading from '../../app/user/loading';
import {
  ChallengeSelect,
  ChallengeVerifyEmail,
  ChallengeVerifyPasskey,
  ChallengeVerifyPhone,
} from '../challenge-select';
import Notification from '../notification';
import IdentifyUser from '../user-container/identify';
import UserDashboard from '../user-dashboard';
import {
  UpdateEmail,
  UpdatePhone,
  UpdateVerifyEmail,
  UpdateVerifyPhone,
} from '../user-update';

type UserRouterProps = { onDone: React.MouseEventHandler<HTMLButtonElement> };

const getHeader = (
  ctx: UserMachineContext,
  leftButton: NavigationHeaderLeftButtonProps,
): ((props: HeaderProps) => JSX.Element) =>
  function Header({ title, subtitle }): JSX.Element {
    return (
      <StepHeader leftButton={leftButton} subtitle={subtitle} title={title} />
    );
  };

const UserRouter = ({ onDone }: UserRouterProps): JSX.Element | null => {
  const [state, send] = useUserMachine();
  const { t } = useTranslation('auth');
  const isDone = state.matches('success');
  const Header = getHeader(state.context, getUserLeftNavButton(state, send));

  if (isDone) return null;

  if (state.matches('init')) {
    return <Loading />;
  }
  if (state.matches('identifyUser')) {
    return (
      <IdentifyUser
        authToken={state.context.authToken}
        onError={() => send({ type: 'identifyUserFailed' })}
        onSuccess={payload => send({ type: 'identifyUserDone', payload })}
      />
    );
  }
  if (state.matches('userFound')) {
    return <ChallengeSelect Header={Header} />;
  }
  if (state.matches('emailChallenge')) {
    return <ChallengeVerifyEmail Header={Header} />;
  }
  if (state.matches('phoneChallenge')) {
    return <ChallengeVerifyPhone Header={Header} />;
  }
  if (state.matches('passkeyChallenge')) {
    return (
      <ChallengeVerifyPasskey
        Header={Header}
        onChallengeVerificationSuccess={res =>
          send({
            type: 'setVerifyToken',
            payload: { kind: 'passkey', token: res.authToken },
          })
        }
        onLoginChallengeSuccess={payload =>
          send({ type: 'setPasskeyChallenge', payload })
        }
        onSmsButtonClick={payload => send({ type: 'goToChallenge', payload })}
      />
    );
  }
  if (state.matches('dashboard')) {
    return <UserDashboard Header={Header} onDone={onDone} isEditing />;
  }
  if (state.matches('updateEmail')) {
    return (
      <UpdateEmail
        Header={Header}
        onSubmit={payload => send({ type: 'setEmail', payload })}
      />
    );
  }
  if (state.matches('updateEmailVerify')) {
    return <UpdateVerifyEmail Header={Header} />;
  }
  if (state.matches('updatePhone')) {
    return (
      <UpdatePhone
        Header={Header}
        onSubmit={payload => send({ type: 'setPhoneNumber', payload })}
      />
    );
  }
  if (state.matches('updatePhoneVerify')) {
    return <UpdateVerifyPhone Header={Header} />;
  }
  if (state.matches('updatePasskey')) {
    return (
      <Header
        title="Feature in Progress"
        subtitle="This functionality is currently undergoing the design phase and development is in progress."
      />
    );
  }
  if (state.matches('notFoundUser')) {
    return (
      <Notification
        title={t('notification.404-user-title')}
        subtitle={t('notification.404-user-description')}
      />
    );
  }
  if (state.matches('notFoundChallenge')) {
    return (
      <Notification
        title={t('notification.404-token-title')}
        subtitle={t('notification.404-token-description')}
      />
    );
  }

  return null;
};

export default UserRouter;
