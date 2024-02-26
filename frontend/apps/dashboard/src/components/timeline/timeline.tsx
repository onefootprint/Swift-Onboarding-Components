import { IcoDotSmall16 } from '@onefootprint/icons';
import {
  AnimatedLoadingSpinner,
  Box,
  Grid,
  Stack,
  Text,
} from '@onefootprint/ui';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { TimelineItemTimeData } from './components/timeline-item-time';
import TimelineItemTime from './components/timeline-item-time';

export type TimelineItem = {
  time?: TimelineItemTimeData;
  iconComponent?: React.ReactNode; // If icon is not provided, we show a dashed line between prev and next items
  headerComponent: React.ReactNode;
  bodyComponent?: React.ReactNode;
};

type TimelineProps = {
  items: TimelineItem[];
  isLoading?: boolean;
};

const HEADER_HEIGHT = '40px';

export const getKeyForItemTime = (time?: TimelineItemTimeData) => {
  if (!time) {
    return 'empty';
  }
  if ('timestamp' in time) {
    return time.timestamp;
  }
  return `${time.start}-${time.end}`;
};

const Timeline = ({ items, isLoading }: TimelineProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.timeline' });
  if (!isLoading && !items.length) {
    return <Text variant="body-4">{t('empty')}</Text>;
  }

  return (
    <>
      <Stack direction="column">
        {items.map((item: TimelineItem, i: number) => {
          const key = `${getKeyForItemTime(item.time)}-${i}`;
          const { iconComponent, headerComponent, bodyComponent } = item;
          const hasDashedBorder = !iconComponent;
          const last = i === items.length - 1;

          return (
            <StepContainer key={key}>
              <TimeContainer direction="row" gap={2} minHeight="40px">
                {item.time && <TimelineItemTime time={item.time} />}
              </TimeContainer>
              <Line
                data-last={last}
                data-dashed={hasDashedBorder}
                last={last}
              />
              <Icon
                align="center"
                justify="center"
                paddingTop={4}
                paddingBottom={4}
                backgroundColor="primary"
                minHeight="40px"
              >
                {iconComponent ?? <IcoDotSmall16 />}
              </Icon>
              <Content direction="column">
                <Header
                  align="center"
                  justify="start"
                  marginLeft={5}
                  marginTop={0}
                >
                  {headerComponent}
                </Header>
                <Stack
                  direction="column"
                  gap={2}
                  width="100%"
                  paddingBottom={7}
                >
                  {bodyComponent && <Box paddingLeft={5}>{bodyComponent}</Box>}
                </Stack>
              </Content>
            </StepContainer>
          );
        })}
      </Stack>
      {isLoading && (
        <Box marginBottom={4}>
          <AnimatedLoadingSpinner animationStart />
        </Box>
      )}
    </>
  );
};

const StepContainer = styled.div`
  display: grid;
  grid-template-columns: 150px 16px 1fr;
  grid-template-rows: auto;
  grid-template-areas:
    'time icon content'
    'empty line content';
  align-items: start;
  justify-content: start;
  overflow: hidden;
`;

const Content = styled(Grid.Item)`
  grid-area: content;
`;

const Icon = styled(Grid.Item)`
  grid-area: icon;
`;

const TimeContainer = styled(Grid.Item)`
  grid-area: time;
`;

const Header = styled(Grid.Item)`
  ${({ theme }) => css`
    grid-area: header;
    min-height: ${HEADER_HEIGHT};
    gap: ${theme.spacing[2]};
  `};
`;

const Line = styled(Grid.Item)<{ last: boolean }>`
  ${({ theme, last }) => css`
    grid-area: icon / line / line;
    position: relative;
    height: 100%;

    ${!last &&
    css`
      &:before {
        content: '';
        display: block;
        width: 1px;
        height: 100%;
        background-color: ${theme.borderColor.primary};
        margin: 0 auto;
      }
    `}
  `}
`;

export default Timeline;
