import type { Icon } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type FeatureCardProps = {
  icon: Icon;
  title: string;
  subtitle: string;
  $gridArea?: string;
};

const FeatureCard = ({ icon: Icon, title, subtitle, $gridArea }: FeatureCardProps) => {
  const renderedIcon = Icon && <Icon />;

  return (
    <Container $gridArea={$gridArea}>
      <IconContainer>{renderedIcon}</IconContainer>
      <Text variant="label-2" color="primary" tag="h3">
        {title}
      </Text>
      <Text variant="body-2" color="primary" tag="p">
        {subtitle}
      </Text>
    </Container>
  );
};

const Container = styled.div<{ $gridArea?: string }>`
  ${({ theme, $gridArea }) => css`
    position: relative;
    display: flex;
    grid-area: ${$gridArea};
    flex-direction: column;
    align-items: flex-start;
    padding: ${theme.spacing[8]};
    gap: ${theme.spacing[5]};
    width: 100%;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 1px;
      background: radial-gradient(
        50% 50% at 50% 50%,
        ${theme.borderColor.primary} 0%,
        ${theme.borderColor.transparent} 100%
      );
    }

    h3 {
      position: relative;
      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: calc(-1 * ${theme.spacing[8]});
        height: 100%;
        width: 1px;
        background-color: ${theme.borderColor.secondary};
      }
    }

    p {
      opacity: 0.75;
    }
  `}
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    height: ${theme.spacing[9]};
    width: ${theme.spacing[9]};
    background-color: ${theme.backgroundColor.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

export default FeatureCard;
