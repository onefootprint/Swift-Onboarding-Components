import { useTranslation } from 'hooks';
import Head from 'next/head';
import React from 'react';
import useSandboxMode from 'src/hooks/use-sandbox-mode';
import styled, { css } from 'styled-components';
import { Box, Typography } from 'ui';

import OnboardingConfigurations from './components/onboarding-configurations';
import SecretKeys from './components/secret-keys';

const Developers = () => {
  const { t } = useTranslation('pages.developers');
  const [isSandboxMode] = useSandboxMode();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Header>
        <Typography variant="heading-2" as="h2">
          {t('header.title')}
        </Typography>
        <Typography
          variant="body-2"
          color={isSandboxMode ? 'warning' : 'success'}
        >
          {isSandboxMode
            ? t('header.subtitle.sandbox')
            : t('header.subtitle.live')}
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
