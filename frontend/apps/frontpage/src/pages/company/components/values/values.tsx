import type { Icon } from 'icons';
import rgba from 'polished/lib/color/rgba';
import React from 'react';
import styled, { css } from 'styled-components';
import { media, Typography } from 'ui';

type ValuesProps = {
  title: string;
  description: string;
  items: {
    id: string;
    title: string;
    description: string;
    iconComponent: Icon;
  }[];
};

const Values = ({ title, description, items }: ValuesProps) => (
  <>
    <TitleContainer>
      <Typography variant="display-3" as="h3" sx={{ marginBottom: 5 }}>
        {title}
      </Typography>
      <Typography variant="body-1" color="secondary">
        {description}
      </Typography>
    </TitleContainer>
    <ItemsContainer>
      {items.map(item => {
        const Icon = item.iconComponent;
        return (
          <Item key={item.id}>
            <IconContainer>
              <Icon />
            </IconContainer>
            <Typography variant="heading-3" as="p" sx={{ marginBottom: 4 }}>
              {item.title}
            </Typography>
            <Typography variant="body-1" color="secondary">
              {item.description}
            </Typography>
          </Item>
        );
      })}
    </ItemsContainer>
  </>
);

const TitleContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[9]}px;

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[10]}px;
    `}
  `}
`;

const ItemsContainer = styled.ul`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]}px;
    grid-template-columns: repeat(1, 1fr);

    ${media.greaterThan('lg')`
      grid-template-columns: repeat(2, 1fr);
    `}
  `}
`;

const Item = styled.li`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius[2]}px;
    padding: ${theme.spacing[8]}px;
  `}
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: ${rgba('#CBC1F6', 0.6)};
    border-radius: ${theme.borderRadius[4]}px;
    display: flex;
    height: 56px;
    justify-content: center;
    margin-bottom: ${theme.spacing[7]}px;
    padding: ${theme.spacing[3]}px;
    width: 56px;
  `}
`;

export default Values;
