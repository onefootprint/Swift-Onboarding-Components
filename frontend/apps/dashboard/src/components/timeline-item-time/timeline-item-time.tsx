import { Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import styled, { css } from 'styled-components';

export type TimelineItemTimeProps = {
  timestamp: string;
};

const TimelineItemTime = ({ timestamp }: TimelineItemTimeProps) => {
  return (
    <TimeContainer>
      <Text variant="snippet-2" color="tertiary">
        {format(new Date(timestamp), 'MM/dd/yy')}
      </Text>
      <Text variant="snippet-2" color="tertiary">
        {format(new Date(timestamp), 'hh:mm a')}
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
