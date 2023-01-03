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
      !isReady ||
      !code ||
      Array.isArray(code)
    ) {
      return;
    }
    login.mutate(code, {
      onSuccess({ authToken, user, tenant }: OrgAuthLoginResponse) {
        if (!user || !tenant) {
          return;
        }
        // TODO handle workos short-lived token
        logIn({
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          org: {
            name: tenant.name,
            sandboxRestricted: tenant.isSandboxRestricted,
            isLive: !tenant.isSandboxRestricted,
          },
          auth: authToken,
        });
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
