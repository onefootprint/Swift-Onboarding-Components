'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createAuthCookie } from '@/app/actions';
import type { LangProp } from '@/app/types';
import {
  DEFAULT_PRIVATE_ROUTE,
  DEFAULT_PUBLIC_ROUTE,
} from '@/config/constants';
import { getErrorMessage } from '@/helpers';
import type { Session } from '@/hooks';
import { useClientStore, useEffectOnce } from '@/hooks';
import postOrgAuthLogin from '@/queries/post-org-auth-login';

import Error from './error';

type FromPromise<T> = T extends Promise<infer U> ? U : T;
type ResLogin = FromPromise<ReturnType<typeof postOrgAuthLogin>>;
type AuthPageProps = {
  params: LangProp; // eslint-disable-line react/no-unused-prop-types
  searchParams: { code?: string; error?: string; state?: string };
};

const getUserPayload = (
  user: NonNullable<ResLogin['user']>,
): Session['user'] => ({
  id: String(user.id),
  email: String(user.email),
  firstName: user?.firstName || null,
  lastName: user?.lastName || null,
  isAssumedSession: false,
  isAssumedSessionEditMode: false,
  isFirmEmployee: user?.isFirmEmployee,
  /** @ts-expect-error: scopes is string vs enum */
  scopes: user?.role.scopes || [],
});

const setLoginSession = (
  update: (x: Partial<Session>) => void,
  res: ResLogin,
) => {
  const {
    authToken,
    createdNewTenant,
    isFirstLogin,
    requiresOnboarding,
    user,
  } = res;
  update({
    auth: authToken,
    user: user ? getUserPayload(user) : undefined,
    meta: { isFirstLogin, requiresOnboarding, createdNewTenant },
  });
};

const AuthPage = ({ searchParams }: AuthPageProps) => {
  const { code, error, state } = searchParams;
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const router = useRouter();
  const [loginError, setLoginError] = useState<string>('');
  const { update } = useClientStore(x => x);

  useEffectOnce(() => {
    if (!code) return;

    postOrgAuthLogin({
      code,
      login_target: 'partner_tenant_dashboard',
    })
      .then(res => {
        setLoginSession(update, res);
        createAuthCookie(res.authToken).then(() => {
          router.push(DEFAULT_PRIVATE_ROUTE);
        });
      })
      .catch(err => {
        setLoginError(
          err.response?.status === 401
            ? getErrorMessage(err)
            : t('session-expired'),
        );
      });
  });

  if (state === 'openedByInvite') {
    return (
      <Error
        header={t('welcome')}
        goToLabel={t('login')}
        goToPath={DEFAULT_PUBLIC_ROUTE}
      >
        {t('invite-accept')}
      </Error>
    );
  }
  if (!code || loginError || (!code && !error && !state)) {
    return (
      <Error
        header={t('please-try-again')}
        goToLabel={t('try-again')}
        goToPath={DEFAULT_PUBLIC_ROUTE}
      >
        {loginError || t('session-expired')}
      </Error>
    );
  }

  return null;
};

export default AuthPage;
