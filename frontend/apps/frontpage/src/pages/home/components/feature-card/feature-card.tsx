import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  createFontStyles,
  LinkButton,
  media,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { isMobile, isTablet } from 'react-device-detect';

type FeatureCardProps = {
  title: string;
  subtitle: string;
  cta?: string;
  children: React.ReactNode;
  gridArea?: string;
  size?: 'compact' | 'default';
};

const FeatureCard = ({
  title,
  subtitle,
  cta,
  children,
  gridArea,
  size = 'default',
}: FeatureCardProps) => {
  let invertedGradient = false;
  switch (gridArea) {
    case 'app-clip':
      invertedGradient = false;
      break;
    case 'fraud-risk':
      if (isMobile && !isTablet) {
        invertedGradient = true;
      } else {
        invertedGradient = false;
      }
      break;
    case 'security-logs':
      invertedGradient = false;
      break;
    case 'id-scans':
      invertedGradient = true;
      break;
    case 'auth':
      if (isMobile && !isTablet) {
        invertedGradient = false;
      } else {
        invertedGradient = true;
      }
      break;
    case 'manual-review':
      invertedGradient = true;
      break;
    default:
      break;
  }

  return (
    <Container gridArea={gridArea} invertedGradient={invertedGradient}>
      {children}
      <TextContainer>
        <Title size={size}>{title}</Title>
        <Typography
          variant={size === 'compact' ? 'body-2' : 'body-1'}
          color="secondary"
        >
          {subtitle}
        </Typography>
        {cta && (
          <LinkButton
            iconComponent={IcoArrowRightSmall16}
            href="https://docs.onefootprint.com/"
            target="_blank"
          >
            {cta}
          </LinkButton>
        )}
      </TextContainer>
    </Container>
  );
};

const Container = styled.div<{
  gridArea?: string;
  invertedGradient?: boolean;
}>`
  ${({ gridArea, theme, invertedGradient }) => css`
    display: flex;
    flex-direction: column;
    grid-area: ${gridArea};
    position: relative;
    background: ${
      invertedGradient
        ? `linear-gradient(0deg, ${theme.backgroundColor.secondary} 0%, transparent 100%)`
        : `linear-gradient(180deg, ${theme.backgroundColor.secondary} 0%, transparent 100%)`
    };

    &:not(:last-child) {
      ${media.lessThan('sm')`
        &::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 1px;
          width: 100%;
          background: radial-gradient(
            50% 100% at 50% 50%,
            ${theme.borderColor.tertiary} 0%,
            ${theme.borderColor.transparent} 100%
          );
        }
      `}
    }

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: ${theme.borderWidth[1]};
      background: radial-gradient(
        50% 50% at 50% 40%,
        ${theme.borderColor.primary} 0%,
        ${theme.backgroundColor.primary} 100%
      );
    `}
`;

const Title = styled.span<{ size: 'compact' | 'default' }>`
  ${({ theme, size }) => css`
    ${size === 'compact'
      ? createFontStyles('label-2')
      : createFontStyles('label-1')}
    color: ${theme.color.primary};
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: calc(-1 * ${theme.spacing[9]});
      top: 0;
      height: 100%;
      width: ${theme.borderWidth[1]};
      background: ${theme.color.accent};
    }
  `}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    padding: ${theme.spacing[9]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

export default FeatureCard;
