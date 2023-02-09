import { useTranslation } from '@onefootprint/hooks';
import { OrgAuthLoginResponse } from '@onefootprint/types';
import { Box, LoadingIndicator, useToast } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import useLogin from 'src/hooks/use-login';
import useSession from 'src/hooks/use-session';

const Auth = () => {
  const { t } = useTranslation('pages.auth');
  const router = useRouter();
  const { isLoggedIn, logIn } = useSession();
  const login = useLogin();
  const toast = useToast();
  // This page is used to handle the workos magic link callback.
  // If the magic link session is valid, workos will pass a code to us that we send to the backend to complete login.
  // If not, workos will send an `error` and `error_description`.
  // We pass state ourselves, which tells us whether the magic link session came from a dashboard
  // invite or a normal login attempt.
  const {
    query: { code, error, state },
    isReady,
  } = router;
  const isOpenedByInvite = state && !Array.isArray(state) && state === 'invite';

  useEffect(() => {
    if (
      !isReady ||
      isLoggedIn ||
      login.isLoading ||
      login.isError ||
      login.isSuccess ||
      Array.isArray(code)
    ) {
      return;
    }
    if (!code || error) {
      // The code is expired
      if (isOpenedByInvite) {
        // Show a message prompting the user to log in to accept their invite
        toast.show({
          title: t('invite.auth-expired.title'),
          description: t('invite.auth-expired.description'),
        });
      } else {
        // Show a message that the auth session expired
        toast.show({
          title: t('workos-error.title'),
          description: t('workos-error.description'),
          variant: 'error',
        });
      }
      router.push('/login');
      return;
    }

    // We have a code from workos - use it to get a dashboard auth token
    login.mutate(code, {
      onSuccess({
        authToken,
        user,
        tenant,
        isFirstLogin,
        createdNewTenant,
      }: OrgAuthLoginResponse) {
        if (!user || !tenant) {
          // The auth token is attached to multiple tenants
          router.push({
            pathname: '/organizations',
            query: { token: authToken },
          });
          return;
        }
        if (isFirstLogin && !createdNewTenant) {
          // Show a message welcoming the user to their dashboard
          toast.show({
            title: t('invite.login-successful.title'),
            description: t('invite.login-successful.description', {
              tenantName: tenant.name,
            }),
          });
        }
        logIn(authToken, user, tenant);
        router.push('/users');
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
        }}
      >
        <LoadingIndicator aria-label={t('loading')} />
      </Box>
    </>
  );
};

export default Auth;
