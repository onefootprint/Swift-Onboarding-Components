import type { OrgAuthLoginResponse } from '@onefootprint/types';
import { Box, useToast } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PUBLIC_ROUTE } from 'src/config/constants';
import useSession from 'src/hooks/use-session';

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
        onSuccess: async ({
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
            await logIn({
              auth: authToken,
              meta: {
                isFirstLogin,
                requiresOnboarding,
                createdNewTenant,
              },
            });
            waitForAnimation(() => {
              router.push(
                requiresOnboarding ? '/onboarding' : DEFAULT_PUBLIC_ROUTE,
              );
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
      <Box aria-label={t('loading-aria-label')} aria-busy>
        <Loading />
      </Box>
    </>
  );
};

export default Auth;
