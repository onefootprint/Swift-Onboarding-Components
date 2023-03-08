import { useTranslation } from '@onefootprint/hooks';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { Fragment } from 'react';
import styled, { css } from 'styled-components';

import TimelineItemTime, {
  TimelineItemTimeData,
} from './components/timeline-item-time';

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
  const { t } = useTranslation('components.timeline');
  if (!isLoading && !items.length) {
    return <Typography variant="body-4">{t('empty')}</Typography>;
  }

  return (
    <>
      <TimelineContainer>
        {items.map((item: TimelineItem, i: number) => {
          const key = `${getKeyForItemTime(item.time)}-${i}`;
          const { iconComponent, headerComponent, bodyComponent } = item;
          const hasDashedBorder = !iconComponent;
          const { length } = items;

          return (
            <Fragment key={key}>
              <TimeContainer hasDashedBorder={hasDashedBorder} index={i}>
                {item.time && <TimelineItemTime time={item.time} />}
              </TimeContainer>
              <TextContainer
                hasDashedBorder={hasDashedBorder}
                index={i}
                length={length}
              >
                <HeaderContainer>
                  {iconComponent && (
                    <IconContainer index={i}>{iconComponent}</IconContainer>
                  )}
                  {headerComponent}
                </HeaderContainer>
                <BodyContainer>{bodyComponent}</BodyContainer>
                <Mask index={i} length={length} />
              </TextContainer>
            </Fragment>
          );
        })}
      </TimelineContainer>
      {isLoading && (
        <LoadingContainer>
          <LoadingIndicator />
        </LoadingContainer>
      )}
    </>
  );
};

const TimelineContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto;
  align-content: left;
  justify-content: left;
`;

const TimeContainer = styled.div<{ hasDashedBorder: boolean; index: number }>`
  ${({ theme }) => css`
    grid-column-start: 1;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    margin-right: ${theme.spacing[7]};
  `};

  // If the first item has the dashed connector, the first row is shifted down
  ${({ theme, hasDashedBorder, index }) =>
    hasDashedBorder &&
    index === 0 &&
    css`
      padding-top: ${theme.spacing[5]};
    `};
`;

const IconContainer = styled.div<{ index: number }>`
  ${({ theme }) => css`
    display: flex;
    align-items: flex-start;
    padding: ${theme.spacing[3]};
    background: ${theme.backgroundColor.primary};
    position: absolute;
    z-index: 3;
    left: calc(-1 * ${theme.spacing[5]});
    top: ${theme.spacing[7]};
  `};

  // Align the icon with the text
  ${({ index, theme }) =>
    index === 0 &&
    css`
      top: calc(-1 * ${theme.spacing[2]});
    `};
`;

const TextContainer = styled.div<{
  hasDashedBorder: boolean;
  index: number;
  length: number;
}>`
  ${({ theme }) => css`
    grid-column-start: 2;
    background: ${theme.backgroundColor.primary};
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: ${theme.spacing[8]} 0 ${theme.spacing[8]} ${theme.spacing[7]};
    margin-top: calc(-1 * ${theme.spacing[8]});
    border-left: 2px solid ${theme.borderColor.primary};
  `};

  ${({ hasDashedBorder }) =>
    hasDashedBorder &&
    css`
      z-index: 2;
      border-left-style: dashed;
    `};

  ${({ index, length }) =>
    index === length - 1 &&
    css`
      padding-bottom: 0;
    `};

  ${({ index }) =>
    index === 0 &&
    css`
      padding-top: 0;
      margin-top: 0;
    `};

  // If the first item has the dashed connector, the first row is shifted down
  ${({ hasDashedBorder, index, theme }) =>
    hasDashedBorder &&
    index === 0 &&
    css`
      padding-top: ${theme.spacing[5]};
    `};
`;

// Hides the tail end of the border if the last item has a body
const Mask = styled.div<{ index: number; length: number }>`
  ${({ theme, index, length }) =>
    index === length - 1 &&
    css`
      position: absolute;
      background: ${theme.backgroundColor.primary};
      top: ${theme.spacing[8]};
      width: 2px;
      height: calc(100% - ${theme.spacing[8]});
      left: -2px;
    `};
`;

const HeaderContainer = styled.div`
  display: flex;
`;

const BodyContainer = styled.div`
  ${({ theme }) => css`
    margin: ${theme.spacing[2]} 0 0 ${theme.spacing[6]};
  `};
`;

const LoadingContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[4]};
  `};
`;

export default Timeline;
