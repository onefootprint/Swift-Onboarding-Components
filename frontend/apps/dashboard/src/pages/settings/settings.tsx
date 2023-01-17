import { useTranslation } from '@onefootprint/hooks';
import { Box, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled-components';

import BusinessProfile from './components/business-profile';

const Settings = () => {
  const { t } = useTranslation('pages.settings');

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Header>
        <Typography variant="heading-2" as="h2">
          {t('header.title')}
        </Typography>
      </Header>
      <Box>
        <BusinessProfile />
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
