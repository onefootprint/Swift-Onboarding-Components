import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useRequestErrorToast } from '@onefootprint/hooks';
import { useRouter } from 'next/router';
import useComposeDocsLoginUrl from 'src/hooks/use-compose-docs-login-url';
import useFilters from 'src/hooks/use-filters';
import useSession from 'src/hooks/use-session';
import Loading from '../../auth/components/loading';

type DocsLoginFilters = {
  redirectUrl?: string;
};

const DocsLogin = () => {
  const { t } = useTranslation('authentication', { keyPrefix: 'docs' });
  const { isLoggedIn } = useSession();
  const router = useRouter();
  const { query, isReady } = useFilters<DocsLoginFilters>({});
  const composeDocsLoginUrl = useComposeDocsLoginUrl();
  const redirectUrl = query.redirectUrl || '/api-reference';
  const showErrorToast = useRequestErrorToast();

  useEffect(() => {
    if (!isReady || composeDocsLoginUrl.isPending || composeDocsLoginUrl.isError) {
      return;
    }
    if (!isLoggedIn) {
      // If we visit this page while not logged in, the Gate component will automatically redirect us to the
      // login page and prompt the user to log into the dashboard.
      // After the user is logged into the dashboard, we'll be redirected back here.
      return;
    }
    // Redirect to the docs site with the docs-specific token in the URL hash.
    composeDocsLoginUrl.mutate(redirectUrl, {
      onSuccess: docsSiteLink => {
        router.push(docsSiteLink);
      },
      onError: showErrorToast,
    });
  }, [isReady, isLoggedIn, composeDocsLoginUrl, router, showErrorToast]);

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

export default DocsLogin;
