import * as React from 'react';
import {
  StyleSheet,
  GestureResponderEvent,
  TouchableOpacity,
  Text,
} from 'react-native';
import styled, { css } from '@onefootprint/styled';

export type ButtonProps = {
  children: string;
  // disabled?: boolean;
  // fullWidth?: boolean;
  // loading?: boolean;
  // loadingAriaLabel?: string;
  // size?: ButtonSize;
  // testID?: string;
  // variant?: ButtonVariant;
  onPress?: (event: GestureResponderEvent) => void;
};

const Button = ({
  children,
  // size,
  // variant = 'primary',
  onPress,
}: ButtonProps) => {
  return (
    <ButtonContainer onPress={onPress}>
      <Text style={styles.text}>{children}</Text>
    </ButtonContainer>
  );
};

const styles = StyleSheet.create({
  text: {
    color: 'white',
  },
});

const ButtonContainer = styled.TouchableOpacity`
  ${({ theme }) => {
    const { button } = theme.components;

    return css`
      background-color: ${button.variant.primary.bg};
    `;
  }}
`;

export default Button;
