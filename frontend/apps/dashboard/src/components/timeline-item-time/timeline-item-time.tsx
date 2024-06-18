import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type TimelineItemTimeData =
  | {
      timestamp: string;
    }
  | {
      start: string;
      end: string;
    };

export type TimelineItemTimeProps = {
  time: TimelineItemTimeData;
};

const TimelineItemTime = ({ time }: TimelineItemTimeProps) => {
  const isTimestamp = 'timestamp' in time;
  if (isTimestamp) {
    return (
      <TimeContainer>
        <Text variant="label-3" color="tertiary">
          {new Date(time.timestamp).toLocaleString('en-us', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
          })}
        </Text>
        <Text variant="label-3" color="tertiary">
          {new Date(time.timestamp).toLocaleString('en-us', {
            hour: 'numeric',
            minute: 'numeric',
          })}
        </Text>
      </TimeContainer>
    );
  }

  // Only show one date if start and end dates are the same
  const start = new Date(time.end).toLocaleString('en-us', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
  const end = new Date(time.end).toLocaleString('en-us', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
  const shouldCollapseRange = start === end;
  if (shouldCollapseRange) {
    return (
      <TimeContainer>
        <Text variant="label-3" color="tertiary">
          {start}
        </Text>
        <Text variant="label-3" color="tertiary">
          --
        </Text>
      </TimeContainer>
    );
  }

  return (
    <TimeContainer>
      <Text variant="label-3" color="tertiary">
        {start}
      </Text>
      <Text variant="label-3" color="tertiary" marginLeft={1} marginRight={1}>
        -
      </Text>
      <Text variant="label-3" color="tertiary">
        {end}
      </Text>
    </TimeContainer>
  );
};

const TimeContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: ${theme.spacing[1]};
    margin-right: ${theme.spacing[1]};

    p {
      min-width: 72px;
    }
  `}
`;

export default TimelineItemTime;
