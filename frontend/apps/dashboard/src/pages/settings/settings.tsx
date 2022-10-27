import { useTranslation } from '@onefootprint/hooks';
import { Box, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled-components';

import BusinessProfile from './components/business-profile';
import TeamRoles from './components/team-roles';

const Settings = () => {
  const { t } = useTranslation('pages.settings');

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Header>
        <Typography variant="heading-3" as="h2" sx={{ marginBottom: 2 }}>
          {t('header.title')}
        </Typography>
      </Header>
      <Box sx={{ marginBottom: 10 }}>
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
    margin-bottom: ${theme.spacing[9]}px;
  `};
`;

export default Settings;
