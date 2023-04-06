import { useTranslation } from '@onefootprint/hooks';
import { OrgAuthLoginResponse } from '@onefootprint/types';
import { Box, useToast } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import useSession from 'src/hooks/use-session';

import Loading from './components/loading';
import useLogin from './hooks/use-login';
import useTrackAnimationDuration from './hooks/use-track-animation-duration';
import useWorkosParams from './hooks/use-workos-params';

const Auth = () => {
  const { t } = useTranslation('pages.auth');
  const router = useRouter();
  const toast = useToast();
  const loginMutation = useLogin();
  const { logIn } = useSession();
  const { isFinished, getRemainingDuration } = useTrackAnimationDuration();

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
      loginMutation.mutate(code, {
        onSuccess: ({
          authToken,
          user,
          tenant,
          isFirstLogin,
          requiresOnboarding,
          createdNewTenant,
        }: OrgAuthLoginResponse) => {
          const requiresOrganizationSelection = !user || !tenant;
          if (requiresOrganizationSelection) {
            waitForAnimation(() => {
              router.push({
                pathname: '/organizations',
                query: { token: authToken },
              });
            });
          } else {
            // Will simplify in follow-up
            logIn({
              auth: authToken,
              user: {
                ...user,
                scopes: user.role.scopes,
              },
              org: tenant,
              meta: {
                isFirstLogin,
                requiresOnboarding,
                createdNewTenant,
                isAssumed: user.rolebinding == null, // If there's no rolebinding, we have an assumed session
              },
            });
            waitForAnimation(() => {
              router.push(requiresOnboarding ? '/onboarding' : '/users');
            });
          }
        },
      });
    },
    onCodeNotFound: () => {
      toast.show({
        title: t('workos-error.title'),
        description: t('workos-error.description'),
        variant: 'error',
      });
      router.push('/login');
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
      router.push('/login');
    },
  });

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box aria-label={t('aria-label')} aria-busy>
        <Loading />
      </Box>
    </>
  );
};

export default Auth;
