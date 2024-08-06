import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_REFERENCE_PATH } from 'src/config/constants';
import useSession from 'src/hooks/use-session';
import Loading from './components/loading';

type AuthQuery = {
  redirectUrl?: string;
};

/** The docs site piggybacks on the dashboard's authentication. In order to log in, we redirect to the dashboard. After logging into the dashboard, we are redirected here with the auth token in the URL fragment, along with a target page to visit in the querystring. */
const Auth = () => {
  const router = useRouter();
  const { logIn } = useSession();
  const { t } = useTranslation('common', { keyPrefix: 'pages.login' });

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const urlFragment = router.asPath.split('#')[1];
    const redirectUrl = (router.query as AuthQuery).redirectUrl || API_REFERENCE_PATH;

    logIn({ authToken: urlFragment })
      .then(() => {
        router.push(redirectUrl);
      })
      .catch(() => {
        // If an error occurs, leave some time to show the toast before we redirect
        setTimeout(() => {
          router.push(redirectUrl);
        }, 3000);
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

export default Auth;
