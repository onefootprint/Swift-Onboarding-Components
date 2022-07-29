import { useTranslation } from 'hooks';
import Head from 'next/head';
import React from 'react';
import useIsSandbox from 'src/hooks/use-is-sandbox';
import styled, { css } from 'styled-components';
import { Box, Typography } from 'ui';

import OnboardingConfigurations from './components/onboarding-configurations';
import SecretKeys from './components/secret-keys';

const Developers = () => {
  const { t } = useTranslation('pages.developers');
  const isSandbox = useIsSandbox();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Header>
        <Typography variant="heading-2" as="h2">
          {t('header.title')}
        </Typography>
        <Typography variant="body-2" color={isSandbox ? 'warning' : 'success'}>
          {isSandbox ? t('header.subtitle.sandbox') : t('header.subtitle.live')}
        </Typography>
      </Header>
      <Box sx={{ marginBottom: 9 }}>
        <SecretKeys />
      </Box>
      <Box>
        <OnboardingConfigurations />
      </Box>
    </>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[2]}px;
    margin-bottom: ${theme.spacing[9]}px;
  `}
`;

export default Developers;
