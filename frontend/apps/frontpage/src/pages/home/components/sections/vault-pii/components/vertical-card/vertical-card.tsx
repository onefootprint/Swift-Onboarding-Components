import { primitives } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import React from 'react';

type VerticalCardProps = {
  title: string;
  subtitle: string;
  iconComponent?: Icon;
  children: React.ReactNode;
  gridArea?: string;
  hideFadeOutMask?: boolean;
};

const VerticalCard = ({
  title,
  subtitle,
  iconComponent: Icon,
  children,
  gridArea,
  hideFadeOutMask = false,
}: VerticalCardProps) => {
  const renderedIcon = Icon && <Icon color="quinary" />;
  return (
    <Container gridArea={gridArea}>
      <ImageContainer hideFadeOutMask={hideFadeOutMask}>
        {children}
      </ImageContainer>
      <TextContainer>
        <Title>
          {renderedIcon} {title}
        </Title>
        <SubtitleText>{subtitle}</SubtitleText>
      </TextContainer>
    </Container>
  );
};

const SubtitleText = styled.p`
  ${createFontStyles('body-2')}
  color: ${primitives.Gray100};
`;

const Container = styled.div<{ gridArea?: string }>`
  ${({ theme, gridArea }) => css`
    position: relative;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${primitives.Gray700};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    grid-area: ${gridArea};
    isolation: isolate;
    z-index: 1;
    background: radial-gradient(
        60% 50% at 50% 10%,
        ${primitives.Gray800} 0%,
        ${primitives.Gray800} 40%,
        transparent 100%
      ),
      ${primitives.Gray900};
  `}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[8]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

const Title = styled.h2`
  ${({ theme }) => css`
    ${createFontStyles('label-2')}
    display: flex;
    align-items: center;
    gap: ${theme.spacing[4]};
    color: ${primitives.Gray0};
  `}
`;

const ImageContainer = styled.div<{ hideFadeOutMask?: boolean }>`
  ${({ hideFadeOutMask }) => css`
    height: 308px;
    width: 100%;
    display: flex;
    position: relative;
    z-index: 1;
    background: radial-gradient(
      80% 50% at 50% 40%,
      ${primitives.Gray1000} 0%,
      transparent 100%
    );
    mask: ${hideFadeOutMask
      ? `linear-gradient(180deg, white 90%, transparent 95%)`
      : `linear-gradient(180deg, white 75%, transparent 100%)`};
    mask-mode: alpha;
  `}
`;

export default VerticalCard;
