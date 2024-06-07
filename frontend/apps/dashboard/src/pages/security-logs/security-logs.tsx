import type { AccessEvent } from '@onefootprint/types';
import { SearchInput, Text } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Timeline from 'src/components/timeline';
import { MAIN_PAGE_ID } from 'src/config/constants';
import styled, { css } from 'styled-components';

import Dot from './components/dot';
import SecurityLogBody from './components/security-log-body';
import SecurityLogHeader from './components/security-log-header';
import SecurityLogsFilters from './components/security-logs-filters';
import useGetAccessEvents from './hooks/use-get-access-events';
import useSecurityLogsFilters from './hooks/use-security-logs-filters';

const SecurityLogs = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.security-logs' });
  const filters = useSecurityLogsFilters();
  const getAccessEvents = useGetAccessEvents();
  const accessEvents =
    (getAccessEvents.data?.pages || []).reduce((allPages, page) => [...allPages, ...page.data], [] as AccessEvent[]) ||
    [];

  const items = accessEvents.map(item => ({
    time: { timestamp: item.timestamp },
    iconComponent: <Dot />,
    headerComponent: <SecurityLogHeader accessEvent={item} />,
    bodyComponent: <SecurityLogBody accessEvent={item} />,
  }));

  const handleScroll = () => {
    // Just before reaching the bottom of the page, start loading the next page of data
    const mainContainer = document.getElementById(MAIN_PAGE_ID);
    if (!mainContainer) return;
    const offset = mainContainer.clientHeight * 0.25;
    const reachedBottom = mainContainer.scrollHeight - mainContainer.scrollTop <= mainContainer.clientHeight + offset;
    if (reachedBottom) {
      if (!getAccessEvents.isFetchingNextPage && getAccessEvents.hasNextPage) {
        getAccessEvents.fetchNextPage();
      }
    }
  };

  useEffect(() => {
    const mainContainer = document.getElementById(MAIN_PAGE_ID);
    mainContainer?.addEventListener('scroll', handleScroll);
    return () => {
      mainContainer?.removeEventListener('scroll', handleScroll);
    };
  });

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Text variant="heading-2" marginBottom={5}>
        {t('header.title')}
      </Text>
      <FiltersContainer>
        <SearchInput
          width="232px"
          onChangeText={value => filters.push({ search: value })}
          value={filters.query.search || ''}
          size="compact"
          placeholder={t('filters.search')}
        />
        <SecurityLogsFilters />
      </FiltersContainer>
      <Timeline items={items} isLoading={getAccessEvents.isLoading || getAccessEvents.isFetchingNextPage} />
    </>
  );
};

const FiltersContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding-bottom: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[7]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default SecurityLogs;
