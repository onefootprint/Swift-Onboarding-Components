import { primitives } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import { createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

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
          <TitleText>{title}</TitleText>
        </Title>
        <SubtitleText>{subtitle}</SubtitleText>
      </TextContainer>
      <ImageContainer>{children}</ImageContainer>
    </Container>
  );
};

const TitleText = styled.h3`
  ${createFontStyles('label-2')};
  color: ${primitives.Gray0};
`;

const SubtitleText = styled.p`
  ${createFontStyles('body-2')};
  color: ${primitives.Gray100};
`;

const Container = styled.div<{ gridArea?: string }>`
  ${({ gridArea, theme }) => css`
    display: grid;
    width: 100%;
    grid-area: ${gridArea};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${primitives.Gray700};
    overflow: hidden;
    background-color: ${primitives.Gray900};
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
      background-color: ${primitives.Gray900};
    `}
  `}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
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
      background: radial-gradient(
          60% 100% at 50% 50%,
          ${primitives.Gray850} 0%,
          transparent 100%
        );
    `}
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
