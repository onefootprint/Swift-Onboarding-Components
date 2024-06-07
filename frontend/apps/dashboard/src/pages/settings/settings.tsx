import { Box, Text, ThemeToggle } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import BusinessProfile from './components/business-profile';
import TeamRoles from './components/team-roles';

const Settings = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.settings' });
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Header>
        <Text variant="heading-2" tag="h2">
          {t('header.title')}
        </Text>
        <ThemeToggle label={t('header.theme')} onChange={handleToggleTheme} checked={theme === 'dark'} />
      </Header>
      <Box marginBottom={10}>
        <BusinessProfile />
      </Box>
      <Box>
        <TeamRoles />
      </Box>
    </>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[7]};
  `};
`;

export default Settings;
