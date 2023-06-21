import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles, media } from '@onefootprint/ui';
import React from 'react';

type MicroFeatureCardProps = {
  title: string;
  subtitle: string;
  gridArea?: string;
  darkTheme?: boolean;
  icon?: Icon;
};

const MicroFeatureCard = ({
  title,
  subtitle,
  gridArea,
  darkTheme,
  icon: Icon,
}: MicroFeatureCardProps) => {
  const icon = Icon && <Icon color={darkTheme ? 'quinary' : 'primary'} />;
  return (
    <Container gridArea={gridArea} darkTheme={darkTheme}>
      <Title darkTheme={darkTheme}>
        {icon}
        {title}
      </Title>
      <TextBlock darkTheme={darkTheme}>{subtitle}</TextBlock>
    </Container>
  );
};

const Container = styled.div<{ gridArea?: string; darkTheme?: boolean }>`
  ${({ gridArea, theme, darkTheme }) => css`
    display: flex;
    flex-direction: column;
    grid-area: ${gridArea};
    position: relative;
    padding: ${theme.spacing[7]};
    gap: ${theme.spacing[2]};

    ${media.greaterThan('md')`
      padding: ${theme.spacing[9]};
    `}

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: ${theme.borderWidth[1]};
      background: ${darkTheme
        ? `radial-gradient(
        50% 50% at 50% 40%,
        #323964 0%,
        ${theme.backgroundColor.tertiary} 100%
      )`
        : `radial-gradient(
        50% 50% at 50% 40%,
        ${theme.borderColor.primary} 0%,
        ${theme.backgroundColor.transparent} 100%
      )`};
    }
  `}
`;

const Title = styled.span<{ darkTheme?: boolean }>`
  ${({ theme, darkTheme }) => css`
    ${createFontStyles('label-3')}
    color: ${darkTheme ? theme.color.quinary : theme.color.primary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: calc(-1 * ${theme.spacing[7]});
      top: 0;
      height: 100%;
      width: ${theme.borderWidth[1]};
      background: ${darkTheme ? '#9B85EB' : theme.color.accent};

      ${media.greaterThan('md')`
        left: calc(-1 * ${theme.spacing[9]});
      `}
    }
  `}
`;

const TextBlock = styled.span<{ darkTheme?: boolean }>`
  ${({ theme, darkTheme }) => css`
    ${createFontStyles('body-3')}
    color: ${darkTheme ? theme.color.quinary : theme.color.secondary};
    opacity: ${darkTheme ? 0.75 : 1};
    position: relative;
  `}
`;

export default MicroFeatureCard;
