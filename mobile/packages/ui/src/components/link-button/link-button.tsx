import type { Icon } from '@onefootprint/icons';
import React, { useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Text } from 'react-native';
import styled, { css } from 'styled-components/native';

import Pressable from '../pressable';
import type { LinkButtonSize, LinkButtonVariant } from './link-button.types';

type IconPosition = 'left' | 'right';

export type LinkButtonProps = {
  'aria-label'?: string;
  children: string;
  disabled?: boolean;
  iconComponent?: Icon;
  iconPosition?: IconPosition;
  onPress?: (event: GestureResponderEvent) => void;
  size?: LinkButtonSize;
  variant?: LinkButtonVariant;
};

const LinkButton = ({
  'aria-label': ariaLabel,
  children,
  disabled = false,
  iconComponent: Icon,
  iconPosition = 'right',
  onPress,
  size = 'default',
  variant = 'default',
}: LinkButtonProps) => {
  const [active, setActive] = useState(false);
  const renderedIcon = Icon && <Icon color={variant === 'default' ? 'accent' : 'error'} />;

  return (
    <StyledPressable
      aria-label={ariaLabel || children}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setActive(true)}
      onPressOut={() => setActive(false)}
      size={size}
    >
      {iconPosition === 'left' && renderedIcon}
      <LinkButtonText variant={variant} size={size} active={active} disabled={disabled}>
        {children}
      </LinkButtonText>
      {iconPosition === 'right' && renderedIcon}
    </StyledPressable>
  );
};

const StyledPressable = styled(Pressable)<{ size: LinkButtonSize }>`
  ${({ theme, size }) => {
    const { linkButton } = theme.components;

    return css`
      align-items: center;
      align-items: center;
      background: transparent;
      flex-direction: row;
      gap: ${theme.spacing[2]};
      height: ${linkButton.size[size].height};
      justify-content: center;
    `;
  }}
`;

const LinkButtonText = styled(Text)<{
  active: boolean;
  disabled: boolean;
  size: LinkButtonSize;
  variant: LinkButtonVariant;
}>`
  ${({ theme, variant, size, active, disabled }) => {
    const { linkButton } = theme.components;
    let color = linkButton.variant[variant].color.text.initial;

    if (disabled) {
      color = linkButton.variant[variant].color.text.disabled;
    } else if (active) {
      color = linkButton.variant[variant].color.text.active;
    }

    return css`
      font: ${linkButton.size[size].typography};
      color: ${color};
    `;
  }}
`;

export default LinkButton;
