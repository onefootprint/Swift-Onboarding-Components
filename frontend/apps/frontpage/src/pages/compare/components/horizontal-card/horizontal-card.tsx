import { createFontStyles, Grid, media, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

type HorizontalCardProps = {
  title: string;
  description: string;
  orientation: 'left' | 'right';
  theme?: 'light' | 'dark';
  children: React.ReactNode;
  cta?: string;
  href?: string;
};

const HorizontalCard = ({
  title,
  description,
  orientation,
  children,
  theme,
  cta,
  href,
}: HorizontalCardProps) => (
  <CardContainer data-orientation={orientation} data-theme={theme}>
    <CardImageContainer className="image">{children}</CardImageContainer>
    <CardContent className="content">
      <Typography
        variant="heading-3"
        as="h3"
        color={theme === 'dark' ? 'quinary' : 'primary'}
      >
        {title}
      </Typography>
      <Typography
        variant="body-1"
        as="p"
        color={theme === 'dark' ? 'quinary' : 'primary'}
      >
        {description}
      </Typography>
      {cta && href && (
        <StyledButtonLink data-theme={theme} href={href} target="_blank">
          {cta}
        </StyledButtonLink>
      )}
    </CardContent>
  </CardContainer>
);

const CardContainer = styled(Grid.Container)`
  ${({ theme }) => css`
    position: relative;
    background-color: rgba(252, 252, 252, 0.6);
    border-radius: ${theme.borderRadius.large};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    overflow: hidden;
    grid-template-columns: 1fr;
    grid-template-rows: 240px 1fr;
    grid-template-areas: 'image' 'content';

    .image {
      grid-area: image;
    }
    .content {
      grid-area: content;
    }

    &[data-theme='dark'] {
      background: linear-gradient(90deg, #0e1438 0%, #0c102c 100%);
    }

    ${media.greaterThan('md')`
      &[data-orientation='right'] {
        grid-template-columns: 480px 1fr;
        grid-template-rows: 1fr;
        grid-template-areas: 'image content';
      }

      &[data-orientation='left'] {
        grid-template-columns: 1fr 480px;
        grid-template-rows: 1fr;
        grid-template-areas: 'content image';
      }
    `}
  `};
`;

const CardImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const CardContent = styled.div`
  ${({ theme }) => css`
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[8]};
    justify-content: center;
    width: 100%;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[12]} ${theme.spacing[10]};
    `}
  `}
`;

const StyledButtonLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('label-2')}
    display: flex;
    align-items: center;
    text-decoration: none;
    transition: opacity 0.2s ease-out;

    @media (hover: hover) {
      &:hover {
        opacity: 0.8;
      }
    }

    &[data-theme='dark'] {
      color: ${theme.color.quinary};
    }
  `}
`;

export default HorizontalCard;
