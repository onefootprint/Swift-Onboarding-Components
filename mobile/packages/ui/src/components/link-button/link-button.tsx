import React from 'react';
import { View, Text, GestureResponderEvent } from 'react-native';
import { Pressable } from '../pressable';
import type { LinkButtonSize, LinkButtonVariant } from './link-button.types';
import styled, { css } from '@onefootprint/styled';

export type LinkButtonProps = {
  'aria-label'?: string;
  //   iconComponent?: Icon;
  //   iconPosition?: IconPosition;
  children: string;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  size?: LinkButtonSize;
  variant?: LinkButtonVariant;
};

const LinkButton = ({
  'aria-label': ariaLabel,
  //   iconComponent: Icon,
  //   iconPosition = 'right',
  children,
  disabled = false,
  onPress,
  size = 'default',
  variant = 'default',
}: LinkButtonProps) => {
  //   const renderedIcon = Icon && (
  //     <Icon color={variant === 'default' ? 'accent' : 'error'} />
  //   );

  return (
    <LinkButtonContainer disabled={disabled} onPress={onPress} size={size}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ButtonText variant={variant} size={size}>
          {children}
        </ButtonText>
      </View>
    </LinkButtonContainer>
  );
};

const LinkButtonContainer = styled(Pressable)<{
  size: LinkButtonSize;
}>`
  ${({ theme, size }) => {
    const { linkButton } = theme.components;

    return css`
      align-items: center;
      background: transparent;
      height: ${linkButton.size[size].height}px;
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
