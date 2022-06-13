import Timeline from '@src/components/timeline';
import { groupBy, omit } from 'lodash';
import React, { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { Box, Button, Code, Divider, SearchInput, Typography } from 'ui';

import { DataKind } from '../users/hooks/use-decrypt-user';
import Dot from './components/dot';
import FieldTagList from './components/field-tag-list';
import useGetAccessEvents, { AccessEvent } from './hooks/use-get-access-events';

const getKey = (e: AccessEvent) => Object.values(omit(e, 'dataKind'));

type AggregatedAccessEvent = {
  dataKinds: DataKind[];
  fpUserId: string;
  reason: string;
  tenantId: string;
  timestamp: string;
  principal: string;
};

const SecurityLogs = () => {
  const [searchText, setSearchText] = useState('');
  const getAccessEvents = useGetAccessEvents();

  const aggregatedAccessEvents = useMemo(() => {
    // If multiple pieces of data were decrypted at the same time, there will be one access event
    // for each field decrypted.
    // Aggregate events for the same user with temporal locality and display them in a single row.
    const accessEvents = getAccessEvents.data || [];
    return Object.values(groupBy(accessEvents, getKey)).map(events => {
      const dataKinds = events.reduce(
        (kinds: DataKind[], event: AccessEvent) => [...kinds, event.dataKind],
        [],
      );
      return {
        ...omit(events[0], 'dataKind'),
        dataKinds,
      } as AggregatedAccessEvent;
    });
  }, [getAccessEvents.data]);

  return (
    <>
      <Typography variant="heading-2">Security logs</Typography>
      <SearchAndFilterContainer>
        <SearchInput
          placeholder="Search..."
          inputSize="compact"
          value={searchText}
          onChangeText={(text: string) => setSearchText(text)}
        />
        <Button size="small" variant="secondary">
          Filters
        </Button>
      </SearchAndFilterContainer>
      <Box sx={{ marginTop: 5, marginBottom: 5 }}>
        <Divider />
      </Box>
      <Timeline
        connectorVariant="tight"
        items={aggregatedAccessEvents.map(item => {
          const headerComponent = (
            <Typography variant="body-3">
              <FieldTagList dataKinds={item.dataKinds} />{' '}
              {item.dataKinds.length > 1 ? 'were' : 'was'} accessed by{' '}
              {item.principal}
            </Typography>
          );

          const bodyComponent = (
            <AccessEventBodyContainer>
              <div>
                <Typography variant="label-3">User</Typography>
                <DataGrid>
                  <Typography variant="label-3" color="tertiary">
                    Footprint token
                  </Typography>
                  <CodeContainer>
                    <Code as="span">{item.fpUserId}</Code>
                  </CodeContainer>
                </DataGrid>
              </div>
              <div>
                {/* TODO https://linear.app/footprint/issue/FP-250/use-real-backend-metadata-for-access-event */}
                <Typography variant="label-3">Metadata</Typography>
                <DataGrid>
                  <Typography variant="label-3" color="tertiary">
                    IP Address
                  </Typography>
                  <Typography variant="body-3">154.143.204.131</Typography>
                  <Typography variant="label-3" color="tertiary">
                    Zip code
                  </Typography>
                  <Typography variant="body-3">27513</Typography>
                  <Typography variant="label-3" color="tertiary">
                    City, State
                  </Typography>
                  <Typography variant="body-3">
                    Raleigh, North Carolina
                  </Typography>
                  <Typography variant="label-3" color="tertiary">
                    Device/OS
                  </Typography>
                  <Typography variant="body-3">
                    Macintosh; Intel Mac OS X 10_15_7
                  </Typography>
                  <Typography variant="label-3" color="tertiary">
                    Country
                  </Typography>
                  <Typography variant="body-3">United States</Typography>
                </DataGrid>
              </div>
              <div>
                <Box sx={{ marginBottom: 5 }}>
                  <Typography variant="label-3">Reason</Typography>
                </Box>
                <Typography variant="body-3">{item.reason}</Typography>
              </div>
            </AccessEventBodyContainer>
          );

          return {
            timestamp: item.timestamp,
            iconComponent: <Dot />,
            headerComponent,
            bodyComponent,
          };
        })}
      />
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

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  ${({ theme }) => css`
    row-gap: ${theme.spacing[3]}px;
    margin-top: ${theme.spacing[5]}px;
  `};
`;

const CodeContainer = styled.div`
  display: flex;
`;

const AccessEventBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  ${({ theme }) => css`
    gap: ${theme.spacing[9]}px;
    margin-top: ${theme.spacing[5]}px;
    margin-bottom: ${theme.spacing[10]}px;
  `};
`;

export default SecurityLogs;
