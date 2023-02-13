import { useTranslation } from '@onefootprint/hooks';
import { AccessEvent } from '@onefootprint/types';
import { Box, SearchInput, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useEffect } from 'react';
import Timeline from 'src/components/timeline';
import styled, { css } from 'styled-components';

import Dot from './components/dot';
import SecurityLogBody from './components/security-log-body';
import SecurityLogHeader from './components/security-log-header';
import SecurityLogsFilters from './components/security-logs-filters';
import useGetAccessEvents from './hooks/use-get-access-events';
import useSecurityLogsFilters from './hooks/use-security-logs-filters';

const SecurityLogs = () => {
  const { t } = useTranslation('pages.security-logs');
  const filters = useSecurityLogsFilters();
  const getAccessEvents = useGetAccessEvents();
  const accessEvents =
    (getAccessEvents.data?.pages || []).reduce(
      (allPages, page) => [...allPages, ...page.data],
      [] as AccessEvent[],
    ) || [];

  const items = accessEvents.map(item => ({
    time: { timestamp: item.timestamp },
    iconComponent: <Dot />,
    headerComponent: <SecurityLogHeader accessEvent={item} />,
    bodyComponent: <SecurityLogBody accessEvent={item} />,
  }));

  const handleScroll = () => {
    // Just before reaching the bottom of the page, start loading the next page of data
    const almostBottom = window.innerHeight * 0.3;
    const reachedBottom =
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - almostBottom;
    if (reachedBottom) {
      if (!getAccessEvents.isFetchingNextPage && getAccessEvents.hasNextPage) {
        getAccessEvents.fetchNextPage();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Typography variant="heading-3" sx={{ marginBottom: 5 }}>
        {t('header.title')}
      </Typography>
      <FiltersContainer>
        <SearchInput
          sx={{ width: '232px' }}
          onChangeText={value => filters.push({ search: value })}
          value={filters.query.search || ''}
        />
        <SecurityLogsFilters />
      </FiltersContainer>
      <Box sx={{ marginTop: 9, marginBottom: 9 }} />
      <Timeline
        items={items}
        isLoading={
          getAccessEvents.isLoading || getAccessEvents.isFetchingNextPage
        }
      />
    </>
  );
};

const FiltersContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[5]};
  `}
`;

export default SecurityLogs;
