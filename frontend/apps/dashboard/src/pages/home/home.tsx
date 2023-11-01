import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Select, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import { OrgMetricsDateRange } from './home.types';
import useFilters from './hooks/use-filters';
import useOrgMetrics from './hooks/use-org-metrics';

const Home = () => {
  const { t } = useTranslation('pages.home');
  const filters = useFilters();
  const { data, isLoading, error } = useOrgMetrics();

  const dateRangeOptions = Object.values(OrgMetricsDateRange).map(value => ({
    label: t(`onboarding-metrics.filter.${value}`),
    value,
  }));

  const filterValue = dateRangeOptions.find(
    ({ value }) => value === filters.values.dateRange,
  );

  const handleFilterChange = (newDateRange: OrgMetricsDateRange) => {
    filters.push({ ...filters.query, dateRange: newDateRange });
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Typography variant="heading-2" sx={{ marginBottom: 7 }}>
        {t('header.title')}
      </Typography>
      {!error && (
        <SectionTitle>
          <Typography variant="label-1">
            {t('onboarding-metrics.title')}
          </Typography>
          <div style={{ width: '220px' }}>
            <Select
              size="compact"
              options={dateRangeOptions}
              onChange={newDateRange => handleFilterChange(newDateRange.value)}
              value={filterValue}
            />
          </div>
        </SectionTitle>
      )}
      {isLoading && <Loading />}
      {error && <Error error={error} />}
      {data && <Content metrics={data} />}
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
