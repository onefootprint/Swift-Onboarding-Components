import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { Fragment } from 'react';

import TimelineItemTime, {
  TimelineItemTimeData,
} from './components/timeline-item-time';

export enum TimelineVariant {
  default = 'default',
  compact = 'compact',
}

export type TimelineItem = {
  time?: TimelineItemTimeData;
  variant?: TimelineVariant;
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
  const { t } = useTranslation('components.timeline');
  if (!isLoading && !items.length) {
    return <Typography variant="body-4">{t('empty')}</Typography>;
  }

  return (
    <>
      <TimelineContainer>
        {items.map((item: TimelineItem, i: number) => {
          const key = `${getKeyForItemTime(item.time)}-${i}`;
          const { variant, iconComponent, headerComponent, bodyComponent } =
            item;
          const hasDashedBorder = !iconComponent;
          const last = i === items.length - 1;

          return (
            <Fragment key={key}>
              <Row>
                <TimeContainer>
                  {item.time && <TimelineItemTime time={item.time} />}
                </TimeContainer>
                <IconAndLine>
                  <Line data-last={last} data-dashed={hasDashedBorder} />
                  {iconComponent && (
                    <IconContainer>{iconComponent}</IconContainer>
                  )}
                </IconAndLine>
                <Content data-variant={variant ?? 'default'}>
                  <Header>{headerComponent}</Header>
                  {bodyComponent && (
                    <BodyContainer>{bodyComponent}</BodyContainer>
                  )}
                </Content>
              </Row>
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
  display: flex;
  flex-direction: column;
`;

const TimeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: ${HEADER_HEIGHT};
  flex-shrink: 0;
  min-width: 150px;
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};
    width: 100%;

    &[data-variant='default'] {
      margin-left: ${theme.spacing[5]};
      padding-bottom: ${theme.spacing[8]};
    }

    &[data-variant='compact'] {
      margin-left: ${theme.spacing[4]};
      padding-bottom: ${theme.spacing[7]};
    }
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-height: ${HEADER_HEIGHT};
    margin-left: ${theme.spacing[1]};

    & > * {
      max-width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      line-height: ${HEADER_HEIGHT};
    }
  `};
`;

const BodyContainer = styled.div`
  ${({ theme }) => css`
    padding-left: ${theme.spacing[5]};
  `};
`;

const LoadingContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[4]};
  `};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  height: auto;
  align-items: stretch;
  position: relative;
`;

const IconAndLine = styled.div`
  position: relative;
  align-items: stretch;
  min-width: 16px;
  flex-shrink: 0;
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    position: relative;
    align-items: flex-start;
    justify-content: center;
    padding: ${theme.spacing[4]} 0;
    background: ${theme.backgroundColor.primary};
    z-index: 3;
  `};
`;

const Line = styled.div`
  ${({ theme }) => css`
    position: absolute;
    z-index: 0;
    top: 0;
    left: 50%;
    width: 0px;
    height: 100%;
    transform: translateX(-50%);
    border-left: ${theme.borderWidth[2]} solid ${theme.borderColor.primary};

    &[data-last='true'] {
      border-left: ${theme.borderWidth[2]} solid
        ${theme.backgroundColor.transparent};
    }

    &[data-dashed='true'] {
      border-left: ${theme.borderWidth[2]} dashed ${theme.borderColor.primary};
    }
  `}
`;

export default Timeline;
