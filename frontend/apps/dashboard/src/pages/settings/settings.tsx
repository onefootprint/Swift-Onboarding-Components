import styled, { css } from '@onefootprint/styled';
import { Box, ThemeToggle, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import { useTheme } from 'next-themes';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
        <Typography variant="heading-2" as="h2">
          {t('header.title')}
        </Typography>
        <ThemeToggle
          label={t('header.theme')}
          onChange={handleToggleTheme}
          checked={theme === 'dark'}
        />
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
