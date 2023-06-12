import type { Icon } from '@onefootprint/icons';
import { createFontStyles, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

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
        <Typography variant="body-2" color="quinary" as="p">
          {subtitle}
        </Typography>
      </TextContainer>
    </Container>
  );
};

const Container = styled.div<{ gridArea?: string }>`
  ${({ theme, gridArea }) => css`
    position: relative;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid #20264f;
    background-color: #0b0f2a;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    grid-area: ${gridArea};
    isolation: isolate;
    z-index: 1;
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
  `}
`;

const ImageContainer = styled.div<{ hideFadeOutMask?: boolean }>`
  ${({ hideFadeOutMask }) => css`
    height: 308px;
    width: 100%;
    display: flex;
    position: relative;
    z-index: 1;
    mask: ${hideFadeOutMask
      ? `linear-gradient(180deg, white 90%, transparent 95%)`
      : `linear-gradient(180deg, white 65%, transparent 95%)`};
    mask-mode: alpha;
    background: radial-gradient(
      100% 100% at 100% 30%,
      rgba(75, 38, 218, 0.3) 0%,
      transparent 100%
    );
  `}
`;

export default VerticalCard;
