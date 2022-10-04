import { AccessEvent } from '@onefootprint/types';
import { Box, Divider, SearchInput, Typography } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import Timeline from 'src/components/timeline';
import styled from 'styled-components';

import Dot from './components/dot';
import FilterDialog from './components/filter-dialog';
import SecurityLogBody from './components/security-log-body';
import SecurityLogHeader from './components/security-log-header';
import { useFilters } from './hooks/use-filters';
import useGetAccessEvents from './hooks/use-get-access-events';

const SecurityLogs = () => {
  const { filters, setFilter } = useFilters();
  const getAccessEvents = useGetAccessEvents();
  const accessEvents =
    (getAccessEvents.data?.pages || []).reduce(
      (allPages, page) => [...allPages, ...page.data],
      [] as AccessEvent[],
    ) || [];

  const items = accessEvents.map(item => ({
    timestamp: item.timestamp,
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
      <Typography variant="heading-3" sx={{ marginBottom: 5 }}>
        Security logs
      </Typography>
      <SearchAndFilterContainer>
        <SearchInput
          sx={{ width: '300px' }}
          inputSize="compact"
          onChangeText={value => setFilter({ search: value })}
          value={filters.search || ''}
        />
        <FilterDialog />
      </SearchAndFilterContainer>
      <Box sx={{ marginTop: 5, marginBottom: 5 }}>
        <Divider />
      </Box>
      <Timeline
        connectorVariant="tight"
        items={items}
        isLoading={
          getAccessEvents.isLoading || getAccessEvents.isFetchingNextPage
        }
      />
    </>
  );
};

const SearchAndFilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default SecurityLogs;
