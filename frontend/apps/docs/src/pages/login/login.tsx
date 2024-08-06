import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_REFERENCE_PATH } from 'src/config/constants';
import useSession from 'src/hooks/use-session';
import Loading from '../auth/components/loading';

type AuthQuery = {
  redirectUrl?: string;
};

/** The docs site piggybacks on the dashboard's authentication. In order to log in, we visit this route which redirects to the dashboard. After logging into the dashboard, we are redirected to /auth. */
const Auth = () => {
  const router = useRouter();
  const { isLoggedIn } = useSession();
  const { t } = useTranslation('common', { keyPrefix: 'pages.login' });

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const redirectUrl = (router.query as AuthQuery).redirectUrl || API_REFERENCE_PATH;

    if (isLoggedIn) {
      router.push(redirectUrl);
    } else {
      // The docs site authentication piggybacks on top of dashboard authentication.
      // We redirect to the dashboard here, which will sign the user in. Upon completion, this route will
      // redirect back to `${DOCS_BASE_URL}/auth#${authToken}`, which will capture the auth token and
      // save it in local storage.
      const docsSignInLink = `${DASHBOARD_BASE_URL}/authentication/docs?redirectUrl=${redirectUrl}`;
      router.push(docsSignInLink);
    }
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
