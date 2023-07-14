import styled, { css } from '@onefootprint/styled';
import { AccessEvent } from '@onefootprint/types';
import { Box, CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import getRegionForInsightEvent from 'src/utils/insight-event-region';
import { displayForUserAgent } from 'src/utils/user-agent';

type SecurityLogBodyProps = {
  accessEvent: AccessEvent;
};

const SecurityLogBody = ({ accessEvent }: SecurityLogBodyProps) => (
  <AccessEventBodyContainer>
    <div>
      <Typography variant="label-3">User</Typography>
      <DataGrid>
        <Typography variant="body-3" color="tertiary">
          Footprint token
        </Typography>
        <CodeContainer>
          <CodeInline isPrivate>{accessEvent.fpId}</CodeInline>
        </CodeContainer>
      </DataGrid>
    </div>
    {accessEvent.insightEvent && (
      <div>
        <Typography variant="label-3">Metadata</Typography>
        <DataGrid>
          <Typography variant="body-3" color="tertiary">
            Region
          </Typography>
          <Typography variant="body-3" isPrivate>
            {getRegionForInsightEvent(accessEvent.insightEvent) || '-'}
          </Typography>
          <Typography variant="body-3" color="tertiary">
            IP Address
          </Typography>
          <Typography variant="body-3" isPrivate>
            {accessEvent.insightEvent.ipAddress || '-'}
          </Typography>
          <Typography variant="body-3" color="tertiary">
            Country
          </Typography>
          <Typography variant="body-3" isPrivate>
            {accessEvent.insightEvent.country || '-'}
          </Typography>
          <Typography variant="body-3" color="tertiary">
            Device/OS
          </Typography>
          <Box
            sx={{
              overflow: 'hidden',
              gridArea: '2 / 4 / span 2 / span 1',
            }}
          >
            <Typography variant="body-3" sx={{ overflow: 'hidden' }} isPrivate>
              {displayForUserAgent(accessEvent.insightEvent.userAgent || '')}
            </Typography>
          </Box>
          <Typography variant="body-3" color="tertiary">
            Zip code
          </Typography>
          <Typography variant="body-3" isPrivate>
            {accessEvent.insightEvent.postalCode || '-'}
          </Typography>
        </DataGrid>
      </div>
    )}
    <div>
      <Box sx={{ marginBottom: 5 }}>
        <Typography variant="body-3">Reason</Typography>
      </Box>
      <Typography variant="body-3">{accessEvent.reason || '-'}</Typography>
    </div>
  </AccessEventBodyContainer>
);

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  ${({ theme }) => css`
    row-gap: ${theme.spacing[3]};
    margin-top: ${theme.spacing[5]};
  `};
`;

const AccessEventBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  ${({ theme }) => css`
    gap: ${theme.spacing[9]};
    margin: ${theme.spacing[5]} 0 ${theme.spacing[9]}
      calc(-1 * ${theme.spacing[3]});
  `};
`;

const CodeContainer = styled.div`
  display: flex;
  grid-column: 2 / span 3;
`;

export default SecurityLogBody;
