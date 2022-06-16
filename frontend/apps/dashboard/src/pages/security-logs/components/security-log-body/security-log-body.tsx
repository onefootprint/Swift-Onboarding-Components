import React from 'react';
import { AccessEvent } from 'src/types';
import styled, { css } from 'styled-components';
import { Box, Code, Typography } from 'ui';

type SecurityLogBodyProps = {
  accessEvent: AccessEvent;
};

const SecurityLogBody = ({ accessEvent }: SecurityLogBodyProps) => (
  <AccessEventBodyContainer>
    <div>
      <Typography variant="label-3">accessEvent</Typography>
      <DataGrid>
        <Typography variant="label-3" color="tertiary">
          Footprint token
        </Typography>
        <CodeContainer>
          <Code as="span">{accessEvent.fpUserId}</Code>
        </CodeContainer>
      </DataGrid>
    </div>
    {accessEvent.insightEvent && (
      <div>
        <Typography variant="label-3">Metadata</Typography>
        <DataGrid>
          <Typography variant="label-3" color="tertiary">
            Zip code
          </Typography>
          <Typography variant="body-3">
            {accessEvent.insightEvent.postalCode || '-'}
          </Typography>
          <Typography variant="label-3" color="tertiary">
            IP Address
          </Typography>
          <Typography variant="body-3">
            {accessEvent.insightEvent.ipAddress || '-'}
          </Typography>
          <Typography variant="label-3" color="tertiary">
            City, State
          </Typography>
          <Typography variant="body-3">
            {accessEvent.insightEvent.city && accessEvent.insightEvent.region
              ? `${accessEvent.insightEvent.city}, ${accessEvent.insightEvent.region}`
              : accessEvent.insightEvent.city ||
                accessEvent.insightEvent.region ||
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
              {accessEvent.insightEvent.userAgent || '-'}
            </Typography>
          </Box>
          <Typography variant="label-3" color="tertiary">
            Country
          </Typography>
          <Typography variant="body-3">
            {accessEvent.insightEvent.country || '-'}
          </Typography>
        </DataGrid>
      </div>
    )}
    <div>
      <Box sx={{ marginBottom: 5 }}>
        <Typography variant="label-3">Reason</Typography>
      </Box>
      <Typography variant="body-3">{accessEvent.reason}</Typography>
    </div>
  </AccessEventBodyContainer>
);

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  ${({ theme }) => css`
    row-gap: ${theme.spacing[3]}px;
    margin-top: ${theme.spacing[5]}px;
  `};
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

const CodeContainer = styled.div`
  display: flex;
`;

export default SecurityLogBody;
