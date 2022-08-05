import { useTranslation } from 'hooks';
import Head from 'next/head';
import React from 'react';
import useSandboxMode from 'src/hooks/use-sandbox-mode';
import styled, { css } from 'styled-components';
import { Box, Toggle, Typography } from 'ui';

import ApiKeys from './components/api-keys';
import OnboardingConfigurations from './components/onboarding-configurations';

const Developers = () => {
  const { t } = useTranslation('pages.developers');
  const [isSandboxMode, toggleSandboxMode] = useSandboxMode();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Header>
        <Box>
          <Typography variant="heading-2" as="h2" sx={{ marginBottom: 2 }}>
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
        </Box>
        <ToggleContainer>
          <Toggle
            aria-label={t('header.toggle-sandbox.label')}
            checked={isSandboxMode}
            label={t('header.toggle-sandbox.label')}
            onChange={toggleSandboxMode}
          />
        </ToggleContainer>
      </Header>
      <Box sx={{ marginBottom: 9 }}>
        <ApiKeys />
      </Box>
      <Box>
        <OnboardingConfigurations />
      </Box>
    </>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[9]}px;
  `};
`;

const ToggleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]}px;
  `};
`;

export default Developers;
