import { IdDI } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useEffectOnceStrict } from '@/src/hooks';
import { useDecryptUser } from '@/src/queries';
import { useUserMachine } from '@/src/state';
import { getLogger } from '@/src/utils';

import Component from './component';

type TComponentProps = ComponentProps<typeof Component>;
type UserDashboardProps = Pick<TComponentProps, 'children' | 'Header'> & {
  isEditing: boolean;
  onDone: React.MouseEventHandler<HTMLButtonElement>;
};

const EmailAndPhone: IdDI[] = [IdDI.email, IdDI.phoneNumber];

const { logWarn } = getLogger('update-verify-email');

const UserDashboard = ({
  children,
  Header,
  isEditing,
  onDone,
}: UserDashboardProps) => {
  const [state, send] = useUserMachine();
  const { userDashboard, verifyToken } = state.context;
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const toast = useToast();
  const mutDecryptUser = useDecryptUser();

  const getAuthAddFlowTexts = () => ({
    add: t('add'),
    addDevice: t('add-device'),
    cta: t('skip-and-finish'),
    deviceAdded: t('device-added'),
    edit: t('edit'),
    headerSubtitle: t('enhance-security-advice'),
    headerTitle: t('additional-verifications'),
  });

  const getEditFlowTexts = () => ({
    add: t('add'),
    addDevice: t('add-device'),
    cta: t('close'),
    deviceAdded: t('device-added'),
    edit: t('edit'),
    headerSubtitle: t('edit-details-in-account'),
    headerTitle: t('revise-auth-details'),
  });

  useEffectOnceStrict(() => {
    if (!verifyToken) {
      logWarn(t('token-missing-error'));
    } else {
      mutDecryptUser.mutate(
        { authToken: verifyToken, fields: EmailAndPhone },
        {
          onError: err => {
            toast.show({
              variant: 'default',
              title: t('fail-to-decrypt'),
              description: t('decrypt-error'),
            });
            logWarn(t('decrypt-error'), err);
          },
          onSuccess: res => {
            send({ type: 'decryptUserDone', payload: res });
          },
        },
      );
    }
  });

  return (
    <Component
      Header={Header}
      entryEmail={{
        isLoading: mutDecryptUser.isLoading,
        label: userDashboard.email?.label || 'Email',
        status: userDashboard.email?.status || 'empty',
        onClick: () => send({ type: 'updateEmail' }),
      }}
      entryPhone={{
        isLoading: mutDecryptUser.isLoading,
        label: userDashboard.phone?.label || 'Phone number',
        status: userDashboard.phone?.status || 'empty',
        onClick: () => send({ type: 'updatePhone' }),
      }}
      entryPasskey={
        isEditing
          ? undefined
          : /* Feature in Progress */ {
              isLoading: mutDecryptUser.isLoading,
              label: userDashboard.passkey?.label || 'Passkey',
              status: userDashboard.passkey?.status || 'empty',
              onClick: () => send({ type: 'updatePasskey' }),
            }
      }
      texts={isEditing ? getEditFlowTexts() : getAuthAddFlowTexts()}
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
