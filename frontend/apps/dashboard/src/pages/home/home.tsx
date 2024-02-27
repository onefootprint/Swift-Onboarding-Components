import { Select, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import ALL_PLAYBOOKS_ID from './constants';
import { OrgMetricsDateRange } from './home.types';
import useFilters from './hooks/use-filters';
import useOrgMetrics from './hooks/use-org-metrics';
import usePlaybookOptions from './hooks/use-playbook-options';

const Home = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home' });
  const filters = useFilters();
  const metrics = useOrgMetrics();
  const { data: playbooksData } = usePlaybookOptions();

  const playbooksFilterValue = playbooksData?.find(
    ({ value }) => value === filters.values.playbook_id,
  ) ?? {
    label: t('onboarding-metrics.filters.all-playbooks'),
    value: ALL_PLAYBOOKS_ID,
  };

  const dateRangeOptions = Object.values(OrgMetricsDateRange).map(value => ({
    label: t(`onboarding-metrics.filters.${value}` as ParseKeys<'common'>),
    value,
  }));

  const dateFilterValue = dateRangeOptions.find(
    ({ value }) => value === filters.values.date_range,
  );

  const handlePlaybooksFilterChange = (newPlaybook: string) => {
    filters.push({
      ...filters.query,
      playbook_id: newPlaybook === ALL_PLAYBOOKS_ID ? undefined : newPlaybook,
    });
  };

  const handleDateFilterChange = (newDateRange: OrgMetricsDateRange) => {
    filters.push({ ...filters.query, date_range: newDateRange });
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Text variant="heading-2" marginBottom={7}>
        {t('header.title')}
      </Text>
      {!metrics.error && (
        <SectionTitle>
          <Text variant="label-1">{t('onboarding-metrics.title')}</Text>
          <Stack gap={4}>
            <div style={{ width: '210px' }}>
              <Select
                size="compact"
                options={dateRangeOptions}
                onChange={newDateRange =>
                  handleDateFilterChange(newDateRange.value)
                }
                value={dateFilterValue}
              />
            </div>
            <div style={{ width: '210px' }}>
              {playbooksData && playbooksData.length > 1 && (
                <Select
                  size="compact"
                  options={playbooksData}
                  onChange={newPlaybook =>
                    handlePlaybooksFilterChange(newPlaybook.value)
                  }
                  value={playbooksFilterValue}
                />
              )}
            </div>
          </Stack>
        </SectionTitle>
      )}
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
