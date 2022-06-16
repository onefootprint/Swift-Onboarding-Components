import React, { useState } from 'react';
import Timeline from 'src/components/timeline';
import styled, { css } from 'styled-components';
import { Box, Button, Divider, SearchInput, Typography } from 'ui';

import Dot from './components/dot';
import SecurityLogBody from './components/security-log-body';
import SecurityLogHeader from './components/security-log-header';
import useGetAccessEvents from './hooks/use-get-access-events';

const SecurityLogs = () => {
  const [searchText, setSearchText] = useState('');
  const getAccessEvents = useGetAccessEvents();
  const accessEvents = getAccessEvents.data || [];

  const items = accessEvents.map(item => ({
    timestamp: item.timestamp,
    iconComponent: <Dot />,
    headerComponent: <SecurityLogHeader accessEvent={item} />,
    bodyComponent: <SecurityLogBody accessEvent={item} />,
  }));

  return (
    <>
      <Typography variant="heading-2">Security logs</Typography>
      <SearchAndFilterContainer>
        <SearchInput
          inputSize="compact"
          onChangeText={setSearchText}
          value={searchText}
        />
        <Button size="small" variant="secondary">
          Filters
        </Button>
      </SearchAndFilterContainer>
      <Box sx={{ marginTop: 5, marginBottom: 5 }}>
        <Divider />
      </Box>
      <Timeline connectorVariant="tight" items={items} />
    </>
  );
};

const SearchAndFilterContainer = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
  ${({ theme }) => css`
    margin-top: ${theme.spacing[5]}px;
  `}
`;

export default SecurityLogs;
