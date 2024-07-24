import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_REFERENCE_PATH } from 'src/config/constants';
import useSession from 'src/hooks/use-session';
import Loading from './components/loading';

/** The docs site piggybacks on the dashboard's authentication. In order to log in, we redirect to the dashboard. After logging into the dashboard, we are redirected here with the auth token in the URL fragment, along with a target page to visit in the querystring. */
const Login = () => {
  const router = useRouter();
  const { logIn } = useSession();
  const { t } = useTranslation('common', { keyPrefix: 'pages.login' });

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const urlFragment = router.asPath.split('#')[1];
    const redirectUrl = API_REFERENCE_PATH;

    logIn({ authToken: urlFragment }).finally(() => {
      router.push(redirectUrl);
    });
  }, [router.isReady, router.asPath]);

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

export default Login;
