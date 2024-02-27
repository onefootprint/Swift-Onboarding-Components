import { LinkButton, media, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type VerticalCardProps = {
  title: string;
  description: string;
  cta?: string;
  children: React.ReactNode;
};

const VerticalCard = ({
  children,
  title,
  description,
  cta,
}: VerticalCardProps) => (
  <CardContainer>
    <CardImageContainer className="image">{children}</CardImageContainer>
    <CardContent className="content">
      <Text variant="heading-3" tag="h3">
        {title}
      </Text>
      <Text variant="body-1">{description}</Text>
      {cta && <LinkButton href="/pricing">{cta}</LinkButton>}
    </CardContent>
  </CardContainer>
);

const CardContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 280px auto;
    grid-template-areas: 'image' 'content';
    background-color: rgba(252, 252, 252, 0.6);
    border-radius: ${theme.borderRadius.large};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    overflow: hidden;
    width: 100%;
  `}
`;

const CardImageContainer = styled.div`
  grid-area: image;
  width: 100%;
  height: 100%;
  position: relative;
`;

const CardContent = styled.div`
  ${({ theme }) => css`
    grid-area: content;
    padding: ${theme.spacing[8]};

    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    align-items: flex-start;
    z-index: 1;

    ${media.greaterThan('sm')`
      padding: ${theme.spacing[10]};
    `}
  `}
`;

export default VerticalCard;
