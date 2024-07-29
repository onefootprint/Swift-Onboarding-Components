import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { composeDocsLoginUrl } = useComposeDocsLoginUrl();
  const redirectUrl = query.redirectUrl || '/api-reference';
  const docsSiteLink = composeDocsLoginUrl(redirectUrl);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!isLoggedIn) {
      // If we're not logged in, the Gate component will automatically redirect us to the login page.
      // After login is complete, we'll be redirected back here.
      return;
    }
    router.push(docsSiteLink);
  }, [isReady, isLoggedIn, docsSiteLink]);

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
