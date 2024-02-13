import type { NavigationHeaderLeftButtonProps } from '@onefootprint/idv';
import { StepHeader } from '@onefootprint/idv';
import {
  Identify,
  IdentifyVariant,
} from '@onefootprint/idv/src/components/identify';
import {
  UpdateEmail,
  UpdatePhone,
} from '@onefootprint/idv/src/components/identify/components/user-update';
import { AuthMethodKind } from '@onefootprint/types/src/data';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { UserMachineContext } from '@/src/state';
import { useUserMachine } from '@/src/state';
import type { HeaderProps } from '@/src/types';
import { getUserLeftNavButton } from '@/src/utils';

import Loading from '../../app/user/loading';
import Notification from '../notification';
import UserDashboard from '../user-dashboard';

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
  const { t } = useTranslation('common');
  const isDone = state.matches('success');
  const Header = getHeader(state.context, getUserLeftNavButton(state, send));

  if (isDone) return null;

  if (state.matches('init')) {
    return <Loading />;
  }
  if (state.matches('identify')) {
    return (
      <Identify
        variant={IdentifyVariant.updateLoginMethods}
        initialAuthToken={state.context.authToken}
        onDone={({ authToken }) =>
          send({ type: 'setVerifyToken', payload: authToken })
        }
        // Since we don't have a playbook for this flow, always treat it as live
        // TODO would be more correct to fetch whether the user defined by the auth token is
        // live or sandbox
        isLive
      />
    );
  }
  if (state.matches('dashboard')) {
    return <UserDashboard Header={Header} onDone={onDone} isEditing />;
  }
  if (state.matches('updateEmail') && state.context.verifyToken) {
    return (
      <UpdateEmail
        Header={Header}
        authToken={state.context.verifyToken}
        onSuccess={newEmail => {
          send({
            type: 'updateUserDashboard',
            payload: {
              kind: AuthMethodKind.email,
              entry: { label: newEmail, status: 'set' },
            },
          });
        }}
      />
    );
  }
  if (state.matches('updatePhone') && state.context.verifyToken) {
    return (
      <UpdatePhone
        Header={Header}
        authToken={state.context.verifyToken}
        onSuccess={newPhoneNumber => {
          send({
            type: 'updateUserDashboard',
            payload: {
              kind: AuthMethodKind.phone,
              entry: { label: newPhoneNumber, status: 'set' },
            },
          });
        }}
      />
    );
  }
  if (state.matches('updatePasskey')) {
    return (
      <Header
        title="Feature in Progress"
        subtitle="This functionality is currently undergoing the design phase and development is in progress."
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
