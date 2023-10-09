import styled, { css } from '@onefootprint/styled';
import { media, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

import BulletItem from './components/bullet-item';
import Illustration from './components/illustration';

type Bullet = {
  title: string;
  subtitle?: string;
};

type PricingCardProps = {
  title: string;
  subtitle: string;
  items: Bullet[];
  illustrationSrc: string;
};

const PricingCard = ({
  title,
  subtitle,
  items,
  illustrationSrc,
}: PricingCardProps) => (
  <Grid>
    <Illustration src={illustrationSrc} />
    <Stack direction="column">
      <Header direction="column">
        <Typography variant="heading-3" color="primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body-4" color="tertiary">
            {subtitle}
          </Typography>
        )}
      </Header>
      <ItemsContainer direction="column" gap={5}>
        {items.map(item => (
          <BulletItem title={item.title} subtitle={item.subtitle} />
        ))}
      </ItemsContainer>
    </Stack>
  </Grid>
);

const Grid = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 800px;
    position: relative;
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    ${media.greaterThan('sm')`
      display: grid;
      grid-template-columns: 1fr 2fr;
      grid-template-rows: 1fr;
    `}

    &:after {
      content: '';
      position: absolute;
      top: 50%;
      right: 50%;
      transform: translate(50%, -50%);
      background: radial-gradient(
        100% 100% at 50% 50%,
        ${theme.backgroundColor.secondary} 0%,
        transparent 50%
      );
      height: 100%;
      width: 100%;
      z-index: -1;

      ${media.greaterThan('md')` 
        height: 200%;
        width: 200%;
      `}
    }
  `}
`;

const Header = styled(Stack)`
  ${({ theme }) => css`
    text-align: center;
    padding: ${theme.spacing[5]} 0 ${theme.spacing[4]} 0;
    position: relative;

    &:after {
      content: '';
      height: ${theme.borderWidth[1]};
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 50%);
      width: 100%;
      background: radial-gradient(
        50% 50% at 50% 50%,
        ${theme.borderColor.primary} 0%,
        transparent 100%
      );
    }
  `}
`;

const ItemsContainer = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[8]} ${theme.spacing[5]};
    height: 100%;

    ${media.greaterThan('sm')`
      padding: ${theme.spacing[8]};
    `}
  `}
`;

export default PricingCard;
