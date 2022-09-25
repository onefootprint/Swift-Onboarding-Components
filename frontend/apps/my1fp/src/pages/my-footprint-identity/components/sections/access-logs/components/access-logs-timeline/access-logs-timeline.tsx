import { AccessLog } from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';
import { Box } from 'ui';

import AccessLogBody from '../access-log-body';
import AccessLogHeader from '../access-log-header';

type AccessLogsTimelineProps = {
  accessLogs: AccessLog[];
};

const AccessLogsTimeline = ({ accessLogs }: AccessLogsTimelineProps) => (
  <>
    {accessLogs.map(accessLog => (
      <AccessLogContainer
        key={`${accessLog.timestamp}-${accessLog.fpUserId}-${
          accessLog.tenantId
        }-${accessLog.principal}-${accessLog.targets.join('-')}`}
      >
        <Connector>
          <Box
            sx={{
              width: '6px',
              minWidth: '6px',
              height: '6px',
              backgroundColor: 'tertiary',
              borderRadius: 2,
              marginTop: 3,
              marginBottom: 3,
            }}
          />
          <Line />
        </Connector>
        <Content>
          <AccessLogHeader accessLog={accessLog} />
          <AccessLogBody accessLog={accessLog} />
        </Content>
      </AccessLogContainer>
    ))}
  </>
);

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]}px;
    margin-left: ${theme.spacing[4]}px;
    margin-bottom: ${theme.spacing[9]}px;
  `};
`;

const AccessLogContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const Connector = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: ${theme.spacing[1]}px;
  `};
`;

const Line = styled.div`
  ${({ theme }) => css`
    height: 100%;
    width: 2px;
    border-radius: ${theme.borderRadius[2]}px;
    background-color: ${theme.backgroundColor.senary};
  `};
`;

export default AccessLogsTimeline;
