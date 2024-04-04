import { Stack, Text } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Content from './components/content';
import DateFilter from './components/date-filter';
import Error from './components/error';
import Loading from './components/loading';
import PlaybooksFilter from './components/playbooks-filter';
import useOrgMetrics from './hooks/use-org-metrics';

const Home = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home' });
  const metrics = useOrgMetrics();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Text variant="heading-2" marginBottom={7}>
        {t('header.title')}
      </Text>
      <SectionTitle>
        <Text variant="label-1">{t('onboarding-metrics.title')}</Text>
        <Stack gap={4}>
          <DateFilter />
          <PlaybooksFilter />
        </Stack>
      </SectionTitle>
      {metrics.isLoading && <Loading />}
      {metrics.error && <Error error={metrics.error} />}
      {metrics.data && <Content metrics={metrics.data} />}
    </>
  );
};

const SectionTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[7]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default Home;
