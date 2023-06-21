import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { media, Typography } from '@onefootprint/ui';
import React from 'react';

type HorizontalCardProps = {
  title: string;
  subtitle: string;
  icon?: Icon;
  children: React.ReactNode;
  gridArea?: string;
};

const HorizontalCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  gridArea,
}: HorizontalCardProps) => {
  const icon = Icon && <Icon color="quinary" />;
  return (
    <Container gridArea={gridArea}>
      <TextContainer>
        <Title>
          {icon}
          <Typography variant="label-2" as="h3" color="quinary">
            {title}
          </Typography>
        </Title>
        <Typography variant="body-2" as="p" color="quinary">
          {subtitle}
        </Typography>
      </TextContainer>
      <ImageContainer>{children}</ImageContainer>
    </Container>
  );
};

const Container = styled.div<{ gridArea?: string }>`
  ${({ gridArea, theme }) => css`
    display: grid;
    width: 100%;
    grid-area: ${gridArea};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid #20264f;
    overflow: hidden;
    background-color: #0b0f2b99;
    z-index: 1;
    grid-template-columns: 100%;
    grid-template-rows: 1fr fit-content(100%);
    grid-template-areas:
      'image'
      'text';

    ${media.greaterThan('md')`
      grid-template-columns: 50% 50%;
      grid-template-rows: 100%;
      grid-template-areas: 'text image';
      height: 480px;
      background-color: #0b0f2b;
    `}
  `}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    align-items: flex-start;
    justify-content: center;
    padding: ${theme.spacing[8]};
    grid-area: text;
    height: 100%;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[10]};
      background: linear-gradient(90deg, #141a42 0%, transparent 100%);
    `}

    p {
      opacity: 0.75;
    }
  `}
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  grid-area: image;
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[4]};
  `}
`;

export default HorizontalCard;
