import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import { GestureResponderEvent, Text } from 'react-native';

import { Pressable } from '../pressable';
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
  const renderedIcon = Icon && (
    <Icon color={variant === 'default' ? 'accent' : 'error'} />
  );

  return (
    <LinkButtonContainer
      aria-label={ariaLabel || children}
      disabled={disabled}
      onPress={onPress}
      size={size}
    >
      {iconPosition === 'left' && renderedIcon}
      <ButtonText variant={variant} size={size}>
        {children}
      </ButtonText>
      {iconPosition === 'right' && renderedIcon}
    </LinkButtonContainer>
  );
};

const LinkButtonContainer = styled(Pressable)<{ size: LinkButtonSize }>`
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

const ButtonText = styled(Text)<{
  variant: LinkButtonVariant;
  size: LinkButtonSize;
}>`
  ${({ theme, size, disabled, variant }) => {
    const { linkButton } = theme.components;

    return css`
      font: ${linkButton.size[size].typography};
      color: ${disabled
        ? linkButton.variant[variant].color.text.disabled
        : linkButton.variant[variant].color.text.initial};
    `;
  }}
`;

export default LinkButton;
