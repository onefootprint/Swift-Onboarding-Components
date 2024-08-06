import { primitives } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import { createFontStyles, media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type MicroFeatureCardProps = {
  title: string;
  subtitle: string;
  $gridArea?: string;
  $isDark?: boolean;
  icon?: Icon;
};

const MicroFeatureCard = ({ title, subtitle, $gridArea, $isDark, icon: Icon }: MicroFeatureCardProps) => {
  const icon = Icon && <Icon color={$isDark ? 'quinary' : 'primary'} />;
  return (
    <Container $gridArea={$gridArea} $isDark={$isDark}>
      <Title $isDark={$isDark}>
        {icon}
        {title}
      </Title>
      <TextBlock $isDark={$isDark}>{subtitle}</TextBlock>
    </Container>
  );
};

const Container = styled.div<{ $gridArea?: string; $isDark?: boolean }>`
  ${({ $gridArea, theme, $isDark }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    grid-area: ${$gridArea};
    padding: ${theme.spacing[7]};
    gap: ${theme.spacing[2]};
    height: fit-content;

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
      background: radial-gradient(
        50% 50% at 50% 40%,
        ${$isDark ? primitives.Gray700 : theme.borderColor.primary} 0%,
        ${theme.backgroundColor.transparent} 100%
      );
    }
  `}
`;

const Title = styled.span<{ $isDark?: boolean }>`
  ${({ theme, $isDark }) => css`
    ${createFontStyles('label-3')}
    color: ${$isDark ? primitives.Gray100 : theme.color.secondary};
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
      background: ${$isDark ? primitives.Purple300 : theme.backgroundColor.accent};

      ${media.greaterThan('md')`
        left: calc(-1 * ${theme.spacing[9]});
      `}
    }

    & {
      svg {
        path {
           {
            fill: ${$isDark && primitives.Gray0};
          }
        }
      }
    }
  `}
`;

const TextBlock = styled.span<{ $isDark?: boolean }>`
  ${({ theme, $isDark }) => css`
    ${createFontStyles('body-3')}
    color: ${$isDark ? primitives.Gray200 : theme.color.secondary};
    position: relative;
  `}
`;

export default MicroFeatureCard;
