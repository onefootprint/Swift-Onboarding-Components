import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import { LinkButton, Text, createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type FeatureCardProps = {
  title: string;
  subtitle: string;
  cta?: string;
  children: React.ReactNode;
  $gridArea?: string;
  size?: 'compact' | 'default';
  href?: string;
  $invertedGradient?: boolean;
};

const FeatureCard = ({
  title,
  subtitle,
  cta,
  href,
  children,
  $gridArea,
  size = 'default',
  $invertedGradient,
}: FeatureCardProps) => (
  <Container $gridArea={$gridArea} $invertedGradient={$invertedGradient}>
    {children}
    <TextContainer>
      <Title size={size}>{title}</Title>
      <Text variant={size === 'compact' ? 'body-2' : 'body-1'} color="secondary">
        {subtitle}
      </Text>
      {cta && (
        <LinkButton iconComponent={IcoArrowRightSmall16} href={href} target="_blank">
          {cta}
        </LinkButton>
      )}
    </TextContainer>
  </Container>
);

const Container = styled.div<{
  $gridArea?: string;
  $invertedGradient?: boolean;
}>`
  ${({ $gridArea, theme, $invertedGradient }) => css`
    display: flex;
    flex-direction: column;
    grid-area: ${$gridArea};
    position: relative;
    background: ${
      $invertedGradient
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
    ${size === 'compact' ? createFontStyles('label-2') : createFontStyles('label-1')}
    color: ${theme.color.primary};
    position: relative;

    ${media.greaterThan('md')`
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
