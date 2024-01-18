import type { T } from '@onefootprint/hooks';
import { useTranslation } from '@onefootprint/hooks';
import type { ComponentProps } from 'react';
import React from 'react';

import { useUserMachine } from '@/src/state';

import Component from './component';

type TComponentProps = ComponentProps<typeof Component>;
type Texts = TComponentProps['texts'];
type UserDashboardProps = Pick<TComponentProps, 'children' | 'Header'> & {
  isEditing: boolean;
  onDone: React.MouseEventHandler<HTMLButtonElement>;
};

const getAuthAddFlowTexts = (t: T): Texts => ({
  add: t('add'),
  addDevice: t('add-device'),
  cta: t('skip-and-finish'),
  deviceAdded: t('device-added'),
  edit: t('edit'),
  headerSubtitle: t('enhance-security-advice'),
  headerTitle: t('additional-verifications'),
});

const getEditFlowTexts = (t: T): Texts => ({
  add: t('add'),
  addDevice: t('add-device'),
  cta: t('close'),
  deviceAdded: t('device-added'),
  edit: t('edit'),
  headerSubtitle: t('edit-details-in-account'),
  headerTitle: t('revise-auth-details'),
});

const UserDashboard = ({
  children,
  Header,
  isEditing,
  onDone,
}: UserDashboardProps) => {
  const [state, send] = useUserMachine();
  const { t } = useTranslation('auth');
  const { userDashboard } = state.context;

  return (
    <Component
      Header={Header}
      entryEmail={{
        label: userDashboard.email?.label || 'Email',
        status: userDashboard.email?.status || 'empty',
        onClick: () => send({ type: 'updateEmail' }),
      }}
      entryPhone={{
        label: userDashboard.phone?.label || 'Phone number',
        status: userDashboard.phone?.status || 'empty',
        onClick: () => send({ type: 'updatePhone' }),
      }}
      entryPasskey={
        isEditing
          ? undefined
          : /* Feature in Progress */ {
              label: userDashboard.passkey?.label || 'Passkey',
              status: userDashboard.passkey?.status || 'empty',
              onClick: () => send({ type: 'updatePasskey' }),
            }
      }
      texts={isEditing ? getEditFlowTexts(t) : getAuthAddFlowTexts(t)}
      cta={{
        isLoading: false,
        onClick: onDone,
        variant: isEditing ? 'primary' : 'secondary',
      }}
    >
      {children}
    </Component>
  );
};

export default UserDashboard;
