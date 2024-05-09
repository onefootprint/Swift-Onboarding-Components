import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type CardBaseProps = {
  id: string;
  isSelected?: boolean;
  onSelect?: () => void;
  title?: string;
  headerIcon: JSX.Element;
  headerText: string;
  rows: JSX.Element[];
  cta?: JSX.Element;
};

const CardBase = ({
  id,
  isSelected,
  onSelect,
  title,
  headerIcon,
  headerText,
  rows,
  cta,
}: CardBaseProps) => (
  <Container
    id={`device-insights-card-${id}`}
    data-selected={!!isSelected}
    onClick={onSelect}
  >
    {title && (
      <Header data-selected={!!isSelected}>
        <Text variant="caption-1">{title}</Text>
      </Header>
    )}
    <Details>
      <IconContainer>
        <Icon>{headerIcon}</Icon>
        <Text variant="label-2" isPrivate>
          {headerText}
        </Text>
      </IconContainer>
      <Rows>{rows}</Rows>
      {cta}
    </Details>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};

    &[data-selected='true'] {
      background-color: rgb(245, 243, 252);
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.secondary};
    }
  `};
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing[3]};
    width: 100%;
    height: 100%;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} 0
      0;

    &[data-selected='true'] {
      background-color: rgb(235, 233, 250);
      border-bottom: ${theme.borderWidth[1]} solid
        ${theme.borderColor.secondary};
    }
  `};
`;

const Details = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing[3]};
    width: 100%;
    height: 100%;
    padding: ${theme.spacing[5]};
    gap: ${theme.spacing[5]};
  `};
`;

const Rows = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[2]};
  `};
`;

const Icon = styled.div`
  ${({ theme }) => css`
    border-radius: 50%;
    background-color: ${theme.backgroundColor.tertiary};
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
  `};
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: ${theme.spacing[4]};
  `};
`;

export default CardBase;
