import { useTranslation } from 'hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import useLogin, { LoginResponse } from 'src/hooks/use-login/use-login';
import useSessionUser from 'src/hooks/use-session-user';
import { Box, LoadingIndicator } from 'ui';

const Auth = () => {
  const { t } = useTranslation('pages.auth');
  const router = useRouter();
  const { isLoggedIn, logIn } = useSessionUser();
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
      !isReady ||
      !code ||
      Array.isArray(code)
    ) {
      return;
    }
    login.mutate(code, {
      onSuccess({
        auth,
        email,
        tenantName,
        sandboxRestricted,
        firstName,
        lastName,
      }: LoginResponse) {
        logIn({
          firstName,
          lastName,
          auth,
          email,
          tenantName,
          sandboxRestricted,
        });
        router.push('/');
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
