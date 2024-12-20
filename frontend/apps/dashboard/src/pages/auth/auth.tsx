import { useToast } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useLoggedOutStorage from 'src/hooks/use-logged-out-storage';
import useSession from 'src/hooks/use-session';

import { type RequestError, useRequestError } from '@onefootprint/request';
import type { OrgLoginResponse } from '@onefootprint/request-types/dashboard';
import { useState } from 'react';
import DomainInUse, { type ConflictingTenantDomainErrorContext } from './components/domain-in-use';
import Loading from './components/loading';
import useLogin from './hooks/use-login';
import useTrackAnimationDuration from './hooks/use-track-animation-duration';
import useWorkosParams from './hooks/use-workos-params';

const Auth = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.auth' });
  const router = useRouter();
  const toast = useToast();
  const loginMutation = useLogin();
  const { logIn } = useSession();
  const { isFinished, getRemainingDuration } = useTrackAnimationDuration();
  const { data, onLoginUrl, reset: resetLoggedOutStorage } = useLoggedOutStorage();
  const { getErrorCode, getErrorContext } = useRequestError();
  const [conflictingTenantErrorContext, setConflictingTenantErrorContext] =
    useState<ConflictingTenantDomainErrorContext | null>(null);

  const waitForAnimation = (callback: () => void) => {
    if (isFinished) {
      callback();
    } else {
      const duration = getRemainingDuration();
      setTimeout(() => {
        callback();
      }, duration);
    }
  };

  useWorkosParams({
    onCodeFound: (code: string) => {
      const requestData = {
        code,
        requestOrgId: data?.orgId,
      };
      loginMutation.mutate(
        { body: requestData },
        {
          onSuccess: async ({
            authToken,
            createdNewTenant,
            isFirstLogin,
            isMissingRequestedOrg,
            requiresOnboarding,
          }: OrgLoginResponse) => {
            await logIn({
              auth: authToken,
              meta: {
                isFirstLogin,
                requiresOnboarding,
                createdNewTenant,
              },
            });
            waitForAnimation(() => {
              if (isMissingRequestedOrg) {
                toast.show({
                  title: t('missing-access.title'),
                  description: t('missing-access.description'),
                  variant: 'error',
                });
              }
              router.push(requiresOnboarding ? '/onboarding' : onLoginUrl);
              resetLoggedOutStorage();
            });
          },
          onError: (e: RequestError) => {
            if (getErrorCode(e) === 'E129') {
              const context = getErrorContext(e) as ConflictingTenantDomainErrorContext;
              setConflictingTenantErrorContext(context);
            }
          },
        },
      );
    },
    onCodeNotFound: () => {
      toast.show({
        title: t('workos-error.title'),
        description: t('workos-error.description'),
        variant: 'error',
      });
      router.push('/authentication/login');
    },
    onError: (openedByInvite: boolean) => {
      if (openedByInvite) {
        toast.show({
          title: t('invite.auth-expired.title'),
          description: t('invite.auth-expired.description'),
          variant: 'error',
        });
      } else {
        toast.show({
          title: t('workos-error.title'),
          description: t('workos-error.description'),
          variant: 'error',
        });
      }
      router.push('/authentication/login');
    },
  });

  if (conflictingTenantErrorContext) {
    return <DomainInUse errorContext={conflictingTenantErrorContext} />;
  }
  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <div aria-label={t('loading-aria-label')} aria-busy>
        <Loading />
      </div>
    </>
  );
};

export default Auth;
