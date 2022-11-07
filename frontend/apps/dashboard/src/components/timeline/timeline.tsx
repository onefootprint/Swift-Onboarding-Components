import { useTranslation } from '@onefootprint/hooks';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { Fragment } from 'react';
import styled, { css } from 'styled-components';

export type TimelineItem = {
  timestamp: string;
  iconComponent: React.ReactNode;
  headerComponent: React.ReactNode;
  bodyComponent?: React.ReactNode;
};

type TimelineProps = {
  items: TimelineItem[];
  isLoading?: boolean;
  connectorVariant?: 'default' | 'tight';
};

const Timeline = ({
  items,
  isLoading,
  connectorVariant = 'default',
}: TimelineProps) => {
  const { t } = useTranslation('components.timeline');
  if (!isLoading && !items.length) {
    return <Typography variant="body-4">{t('empty')}</Typography>;
  }
  return (
    <>
      <TimelineContainer>
        {items.map((item: TimelineItem, i: number) => (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={`${item.timestamp}-${i}`}>
            <Typography variant="label-3" color="tertiary">
              {new Date(item.timestamp).toLocaleString('en-us', {
                month: 'numeric',
                day: 'numeric',
                year: '2-digit',
              })}
            </Typography>
            <Typography variant="label-3" color="tertiary">
              {new Date(item.timestamp).toLocaleString('en-us', {
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Typography>
            <IconContainer>{item.iconComponent}</IconContainer>
            <HeaderContainer>{item.headerComponent}</HeaderContainer>
            {i !== items.length - 1 && <Connector variant={connectorVariant} />}
            {item.bodyComponent && (
              <BodyContainer>{item.bodyComponent}</BodyContainer>
            )}
          </Fragment>
        ))}
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
  ${({ theme }) => css`
    gap: ${theme.spacing[3]} ${theme.spacing[4]};
  `};
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Connector = styled.div<{
  variant: 'default' | 'tight';
}>`
  grid-column-start: 3;
  width: 2px;
  min-height: 24px;
  margin-left: auto;
  margin-right: auto;
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.senary};
    border-radius: ${theme.borderRadius.default};
  `};
  ${({ theme, variant }) =>
    variant === 'tight' &&
    css`
      // Help to fill empty space when the iconComponents are smaller
      margin-top: -${theme.spacing[3]};
      margin-bottom: -${theme.spacing[3]};
    `};
`;

const HeaderContainer = styled.div`
  grid-column-start: 4;
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]};
  `};
`;

const BodyContainer = styled.div`
  grid-column-start: 4;
  ${({ theme }) => css`
    margin-left: calc(${theme.spacing[2]} + ${theme.spacing[5]});
    margin-bottom: ${theme.spacing[4]};
  `};
`;

const LoadingContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[4]};
  `};
`;

export default Timeline;
