'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createAuthCookie } from '@/app/actions';
import type { LangProp } from '@/app/types';
import { DEFAULT_PRIVATE_ROUTE, DEFAULT_PUBLIC_ROUTE } from '@/config/constants';
import { getErrorMessage } from '@/helpers';
import type { Session } from '@/hooks';
import { useClientStore, useEffectOnce } from '@/hooks';
import type { OrgLoginResponse } from '@/queries';
import postPartnerAuthLogin from '@/queries/post-partner-auth-login';

import ErrorComponent from './error';
import getUserPayload from './get-user-payload';

type AuthPageProps = {
  params: LangProp; // eslint-disable-line react/no-unused-prop-types
  searchParams: { code?: string; error?: string; state?: string };
};

const setLoginSession = (update: (x: Partial<Session>) => void, res: OrgLoginResponse) => {
  const { authToken, createdNewTenant, isFirstLogin, requiresOnboarding, user } = res;
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

    postPartnerAuthLogin({
      code,
    })
      .then(res => {
        /** Requires organization selection */
        if (!res.user || !res.partnerTenant) {
          router.push(`/auth/organizations?token=${res.authToken}`);
          return;
        }

        /** Can proceed to dashboard */
        setLoginSession(update, res);
        createAuthCookie(res.authToken).then(() => {
          router.push(DEFAULT_PRIVATE_ROUTE);
        });
      })
      .catch(err => {
        setLoginError(err.response?.status === 401 ? getErrorMessage(err) : t('session-expired'));
      });
  });

  if (state === 'openedByInvite') {
    return (
      <ErrorComponent header={t('welcome')} goToLabel={t('login')} goToPath={DEFAULT_PUBLIC_ROUTE}>
        {t('invite-accept')}
      </ErrorComponent>
    );
  }
  if (!code || loginError || (!code && !error && !state)) {
    return (
      <ErrorComponent header={t('please-try-again')} goToLabel={t('try-again')} goToPath={DEFAULT_PUBLIC_ROUTE}>
        {loginError || t('session-expired')}
      </ErrorComponent>
    );
  }

  return null;
};

export default AuthPage;
