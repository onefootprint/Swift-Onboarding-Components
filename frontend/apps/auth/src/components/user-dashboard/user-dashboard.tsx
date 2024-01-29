import { IdDI } from '@onefootprint/types';
import type { NextToast } from '@onefootprint/ui';
import { useToast } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import type { ComponentProps } from 'react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useEffectOnceStrict } from '@/src/hooks';
import type { UserAuthMethodsResponse } from '@/src/queries';
import { useDecryptUser, useUserAuthMethods } from '@/src/queries';
import { useUserMachine } from '@/src/state';
import type { UserChallengeKind } from '@/src/types';
import { getLogger } from '@/src/utils';

import Component from './component';

type MethodsMap = Record<
  Partial<UserChallengeKind>,
  Pick<UserAuthMethodsResponse[0], 'isVerified'>
>;
type T = TFunction<'common', 'auth'>;
type TComponentProps = ComponentProps<typeof Component>;
type Texts = TComponentProps['texts'];
type UserDashboardProps = Pick<TComponentProps, 'children' | 'Header'> & {
  isEditing: boolean;
  onDone: React.MouseEventHandler<HTMLButtonElement>;
};

const isPassKeyFeatureReady = false;
const EmailAndPhone: IdDI[] = [IdDI.email, IdDI.phoneNumber];
const EmptyMethodsMap: MethodsMap = Object.create(null);

const getAuthAddFlowTexts = (t: T): Texts => ({
  add: t('add'),
  addDevice: t('add-device'),
  cta: t('skip-and-finish'),
  deviceAdded: t('device-added'),
  edit: t('edit'),
  headerSubtitle: t('enhance-security-advice'),
  headerTitle: t('additional-verifications'),
  verified: t('verified'),
});

const getEditFlowTexts = (t: T): Texts => ({
  add: t('add'),
  addDevice: t('add-device'),
  cta: t('close'),
  deviceAdded: t('device-added'),
  edit: t('edit'),
  headerSubtitle: t('edit-details-in-account'),
  headerTitle: t('revise-auth-details'),
  verified: t('verified'),
});

const getDecryptErrorTexts = (t: T): NextToast => ({
  description: t('decrypt-error'),
  title: t('fail-to-decrypt'),
  variant: 'default',
});

const getUserAuthMethods = (list: UserAuthMethodsResponse): MethodsMap =>
  list.reduce<MethodsMap>((objRef, item) => {
    const { kind, canUpdate, ...rest } = item;
    if (canUpdate) {
      objRef[kind] = rest; // eslint-disable-line no-param-reassign
    }
    return objRef;
  }, Object.create(null));

const { logWarn } = getLogger('user-dashboard');

const UserDashboard = ({
  children,
  Header,
  isEditing,
  onDone,
}: UserDashboardProps) => {
  const [state, send] = useUserMachine();
  const { userDashboard, verifyToken } = state.context;
  const { t } = useTranslation('common');
  const qryUserAuthMethods = useUserAuthMethods(verifyToken);
  const mutDecryptUser = useDecryptUser();
  const toast = useToast();

  const methodsMap = useMemo(() => {
    const methods = qryUserAuthMethods.data;
    return methods ? getUserAuthMethods(methods) : EmptyMethodsMap;
  }, [qryUserAuthMethods.data]);

  useEffectOnceStrict(() => {
    if (!verifyToken) {
      logWarn(t('token-missing-error'));
    } else {
      mutDecryptUser.mutate(
        { authToken: verifyToken, fields: EmailAndPhone },
        {
          onError: err => {
            toast.show(getDecryptErrorTexts(t));
            logWarn(t('decrypt-error'), err);
          },
          onSuccess: res => send({ type: 'decryptUserDone', payload: res }),
        },
      );
    }
  });

  return (
    <Component
      Header={Header}
      entryEmail={
        methodsMap.email
          ? {
              isLoading: mutDecryptUser.isLoading,
              isVerified: methodsMap.email.isVerified,
              label: userDashboard.email?.label || t('email'),
              status: userDashboard.email?.status || 'empty',
              onClick: () => send({ type: 'updateEmail' }),
            }
          : undefined
      }
      entryPhone={
        methodsMap.phone
          ? {
              isLoading: mutDecryptUser.isLoading,
              isVerified: methodsMap.phone.isVerified,
              label: userDashboard.phone?.label || t('phone-number'),
              status: userDashboard.phone?.status || 'empty',
              onClick: () => send({ type: 'updatePhone' }),
            }
          : undefined
      }
      entryPasskey={
        methodsMap.passkey && isPassKeyFeatureReady
          ? {
              isLoading: mutDecryptUser.isLoading,
              isVerified: methodsMap.passkey.isVerified,
              label: userDashboard.passkey?.label || t('passkey'),
              status: userDashboard.passkey?.status || 'empty',
              onClick: () => send({ type: 'updatePasskey' }),
            }
          : undefined
      }
      texts={isEditing ? getEditFlowTexts(t) : getAuthAddFlowTexts(t)}
      cta={{
        isLoading: mutDecryptUser.isLoading,
        onClick: onDone,
        variant: isEditing ? 'primary' : 'secondary',
      }}
    >
      {children}
    </Component>
  );
};

export default UserDashboard;
