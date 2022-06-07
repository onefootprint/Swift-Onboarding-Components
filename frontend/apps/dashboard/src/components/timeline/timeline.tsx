import { Icon } from 'icons';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

type TimelineItem = {
  timestamp: string;
  ItemIcon: Icon;
  headerComponent: React.ReactNode;
  bodyComponent?: React.ReactNode;
};

type TimelineProps = {
  items: TimelineItem[];
};

const Timeline = ({ items }: TimelineProps) => (
  <TimelineContainer>
    {items.map((item: TimelineItem, i: number) => (
      <>
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
        <IconContainer>
          <item.ItemIcon />
        </IconContainer>
        <HeaderContainer>{item.headerComponent}</HeaderContainer>
        {(i !== items.length - 1 || !!item.bodyComponent) && <Connector />}
        <BodyContainer>
          {item.bodyComponent && item.bodyComponent}
        </BodyContainer>
      </>
    ))}
  </TimelineContainer>
);

const TimelineContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto;
  align-content: left;
  justify-content: left;
  ${({ theme }) => css`
    gap: ${theme.spacing[3]}px ${theme.spacing[4]}px;
  `};
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Connector = styled.div`
  grid-column-start: 3;
  width: 2px;
  min-height: 24px;
  margin-left: auto;
  margin-right: auto;
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.senary};
    border-radius: ${theme.borderRadius[1]}px;
  `};
`;

const HeaderContainer = styled.div`
  grid-column-start: 4;
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]}px;
  `};
`;

const BodyContainer = styled.div`
  grid-column-start: 4;
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2] + theme.spacing[5]}px;
    margin-bottom: ${theme.spacing[4]}px;
  `};
`;

export default Timeline;
