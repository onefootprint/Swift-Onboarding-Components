import { useTranslation } from '@onefootprint/hooks';
import { OrgAuthLoginResponse } from '@onefootprint/types';
import { Box, LoadingIndicator } from '@onefootprint/ui';
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
  const {
    query: { code },
    isReady,
  } = router;

  useEffect(() => {
    if (
      isLoggedIn ||
      login.isLoading ||
      login.isError ||
      login.isSuccess ||
      !isReady ||
      !code ||
      Array.isArray(code)
    ) {
      return;
    }
    login.mutate(code, {
      onSuccess({ authToken, user, tenant }: OrgAuthLoginResponse) {
        if (!user || !tenant) {
          router.push({
            pathname: '/organizations',
            query: { token: authToken },
          });
          return;
        }

        logIn(authToken, user, tenant);
        router.push('/users');
      },
    });
  });

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
