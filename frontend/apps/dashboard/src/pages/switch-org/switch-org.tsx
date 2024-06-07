import { AnimatedLoadingSpinner, Box } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useRedirect from './hooks/use-redirect';

const SwitchOrg = () => {
  const { t } = useTranslation('switch-org');
  useRedirect();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box center flexDirection="column" height="100%" marginTop={12} width="100%">
        <AnimatedLoadingSpinner animationStart />
      </Box>
    </>
  );
};

export default SwitchOrg;
