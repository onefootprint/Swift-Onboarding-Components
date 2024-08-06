import type { OrgAuthLoginRequest, OrgAuthLoginResponse } from '@onefootprint/types';
import { OrgAuthLoginTarget } from '@onefootprint/types';
import { Box, useToast } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useLoggedOutStorage from 'src/hooks/use-logged-out-storage';
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
  const { data, onLoginUrl, reset: resetLoggedOutStorage } = useLoggedOutStorage();

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
      const requestData: OrgAuthLoginRequest = {
        code,
        requestOrgId: data?.orgId,
        loginTarget: OrgAuthLoginTarget.TenantDashboard,
      };
      loginMutation.mutate(requestData, {
        onSuccess: async ({
          authToken,
          isFirstLogin,
          requiresOnboarding,
          createdNewTenant,
          isMissingRequestedOrg,
        }: OrgAuthLoginResponse) => {
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
      });
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
