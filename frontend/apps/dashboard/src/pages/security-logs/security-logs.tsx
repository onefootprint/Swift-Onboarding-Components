import { groupBy, omit } from 'lodash';
import React, { useMemo, useState } from 'react';
import Timeline from 'src/components/timeline';
import { AccessEvent, DataKind, InsightEvent } from 'src/types';
import styled, { css } from 'styled-components';
import { Box, Button, Code, Divider, SearchInput, Typography } from 'ui';

import Dot from './components/dot';
import FieldTagList from './components/field-tag-list';
import useGetAccessEvents from './hooks/use-get-access-events';

type AggregatedAccessEvent = {
  dataKinds: DataKind[];
  fpUserId: string;
  reason: string;
  tenantId: string;
  timestamp: string;
  principal?: string;
  insightEvent: InsightEvent;
};

const getKey = (e: AccessEvent) => Object.values(omit(e, 'dataKind'));

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
      <Timeline
        connectorVariant="tight"
        items={aggregatedAccessEvents.map(item => {
          const headerComponent = (
            <Typography variant="body-3">
              <FieldTagList dataKinds={item.dataKinds} />{' '}
              {item.dataKinds.length > 1 ? 'were' : 'was'} accessed by{' '}
              {item.principal || 'an automated process'}
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
              {item.insightEvent && (
                <div>
                  <Typography variant="label-3">Metadata</Typography>
                  <DataGrid>
                    <Typography variant="label-3" color="tertiary">
                      Zip code
                    </Typography>
                    <Typography variant="body-3">
                      {item.insightEvent.postalCode || '-'}
                    </Typography>
                    <Typography variant="label-3" color="tertiary">
                      IP Address
                    </Typography>
                    <Typography variant="body-3">
                      {item.insightEvent.ipAddress || '-'}
                    </Typography>
                    <Typography variant="label-3" color="tertiary">
                      City, State
                    </Typography>
                    <Typography variant="body-3">
                      {item.insightEvent.city && item.insightEvent.region
                        ? `${item.insightEvent.city}, ${item.insightEvent.region}`
                        : item.insightEvent.city ||
                          item.insightEvent.region ||
                          '-'}
                    </Typography>
                    <Typography variant="label-3" color="tertiary">
                      Device/OS
                    </Typography>
                    <Box
                      sx={{
                        overflow: 'hidden',
                        gridArea: '2 / 4 / span 2 / span 1',
                      }}
                    >
                      <Typography variant="body-3" sx={{ overflow: 'hidden' }}>
                        {item.insightEvent.userAgent || '-'}
                      </Typography>
                    </Box>
                    <Typography variant="label-3" color="tertiary">
                      Country
                    </Typography>
                    <Typography variant="body-3">
                      {item.insightEvent.country || '-'}
                    </Typography>
                  </DataGrid>
                </div>
              )}
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
