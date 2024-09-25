import type { AuthMethodKind, UserAuthMethodsResponse } from '@onefootprint/types';
import { UserChallengeActionKind } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import type { NextToast } from '@onefootprint/ui';
import { useToast } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import type { ComponentProps } from 'react';
import type React from 'react';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import checkIsIframe from '../../../../../../utils/check-is-in-iframe';

import { getLogger, trackAction } from '../../../../../../utils/logger';
import useEffectOnceStrict from '../../../../hooks/use-effect-once-strict';
import { useDecryptUser, useUserAuthMethods } from '../../../../queries';
import { useAuthMethodsMachine } from '../../state';
import Component from './component';

type T = TFunction<'identify'>;
type TComponentProps = ComponentProps<typeof Component>;
type Texts = TComponentProps['texts'];
type MethodsMap = Record<AuthMethodKind, Pick<UserAuthMethodsResponse[0], 'isVerified'>>;
type DashboardProps = Pick<TComponentProps, 'children' | 'Header'> & {
  isEditing: boolean;
  onDone: React.MouseEventHandler<HTMLButtonElement>;
};

const EmailAndPhone: IdDI[] = [IdDI.email, IdDI.phoneNumber];
const EmptyMethodsMap: MethodsMap = Object.create(null);
const isAppInIframe = checkIsIframe();

const actionKind = (isVerified: boolean): UserChallengeActionKind =>
  isVerified ? UserChallengeActionKind.replace : UserChallengeActionKind.addPrimary;

const getAuthAddFlowTexts = (t: T): Texts => ({
  add: t('add'),
  added: t('added'),
  cta: t('skip-and-finish'),
  edit: t('edit'),
  headerSubtitle: t('enhance-security-advice'),
  headerTitle: t('additional-verifications'),
  replace: t('replace'),
  verified: t('verified'),
});

const getEditFlowTexts = (t: T): Texts => ({
  add: t('add'),
  added: t('added'),
  cta: t('finish'),
  edit: t('edit'),
  headerSubtitle: t('edit-details-in-account'),
  headerTitle: t('revise-auth-details'),
  replace: t('replace'),
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

const { logInfo, logTrack, logWarn } = getLogger({ location: 'auth-methods-dashboard' });

const Dashboard = ({ children, Header, isEditing, onDone }: DashboardProps) => {
  const [state, send] = useAuthMethodsMachine();
  const { device, userDashboard, verifyToken } = state.context;
  const { t } = useTranslation('identify');
  const qryUserAuthMethods = useUserAuthMethods(verifyToken);
  const mutDecryptUser = useDecryptUser();
  const toast = useToast();
  const isLoading = qryUserAuthMethods.isPending || mutDecryptUser.isPending;

  const methodsMap = useMemo(() => {
    const methods = qryUserAuthMethods.data;
    return methods ? getUserAuthMethods(methods) : EmptyMethodsMap;
  }, [qryUserAuthMethods.data]);

  const handleOnEmailClick = () => {
    const payload = actionKind(Boolean(methodsMap?.email?.isVerified));
    trackAction('update-auth-methods:update-started', { kind: 'email', payload });
    logTrack(`User clicked on ${payload} email`);
    send({ type: 'updateEmail', payload });
  };

  const handleOnPhoneClick = () => {
    const payload = actionKind(Boolean(methodsMap?.phone?.isVerified));
    trackAction('update-auth-methods:update-started', { kind: 'phone', payload });
    logTrack(`User clicked on ${payload} phone`);
    send({ type: 'updatePhone', payload });
  };

  const handleOnPasskeyClick = () => {
    const payload = actionKind(Boolean(methodsMap?.passkey?.isVerified));
    trackAction('update-auth-methods:update-started', { kind: 'passkey', payload });
    logTrack(`User clicked on ${payload} passkey`);
    send({ type: 'updatePasskey', payload });
  };

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
          onSuccess: res => {
            logInfo("User's email and phone have been decrypted");
            send({ type: 'decryptUserDone', payload: res });
          },
        },
      );
    }
  });

  /** Update user dashboard status for passkey, based on methodsMap, because it cannot be decrypted */
  useEffect(() => {
    if (!methodsMap.passkey) return;
    if (userDashboard.passkey?.status === 'set') return;

    send({
      type: 'updateUserDashboard',
      payload: {
        kind: 'passkey',
        entry: { status: 'set' },
      },
    });
  }, [methodsMap]);

  return (
    <Component
      Header={Header}
      entryEmail={
        methodsMap.email
          ? {
              isLoading,
              isVerified: methodsMap.email.isVerified,
              label: userDashboard.email?.label || t('email.label'),
              status: userDashboard.email?.status || 'empty',
              onClick: handleOnEmailClick,
            }
          : {
              isLoading,
              isVerified: false,
              label: t('email.label'),
              status: 'empty',
              onClick: handleOnEmailClick,
            }
      }
      entryPhone={
        methodsMap.phone
          ? {
              isLoading,
              isVerified: methodsMap.phone.isVerified,
              label: userDashboard.phone?.label || t('phone-number'),
              status: userDashboard.phone?.status || 'empty',
              onClick: handleOnPhoneClick,
            }
          : {
              isLoading,
              isVerified: false,
              label: t('phone-number'),
              status: 'empty',
              onClick: handleOnPhoneClick,
            }
      }
      entryPasskey={
        device?.hasSupportForWebauthn
          ? {
              isLoading,
              isDisabled: isAppInIframe,
              isVerified: !!methodsMap.passkey?.isVerified,
              label: userDashboard.passkey?.label || t('passkey'),
              status: userDashboard.passkey?.status || 'empty',
              onClick: handleOnPasskeyClick,
            }
          : undefined
      }
      texts={isEditing ? getEditFlowTexts(t) : getAuthAddFlowTexts(t)}
      cta={{
        isLoading,
        onClick: onDone,
        variant: isEditing ? 'primary' : 'secondary',
      }}
    >
      {children}
    </Component>
  );
};

export default Dashboard;
