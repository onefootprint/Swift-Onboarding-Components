import React from 'react';
import {
  GestureResponderEvent,
  Pressable as RNPressable,
  ViewStyle,
} from 'react-native';

import haptic from '../../utils/haptic';

export type PressableProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  onPressIn?: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  withImpact?: boolean;
};

const Pressable = ({
  children,
  disabled = false,
  onPress,
  onPressIn,
  onPressOut,
  style = {},
  withImpact,
}: PressableProps) => {
  const handlePress = (event: GestureResponderEvent) => {
    if (withImpact) haptic.impact();
    onPress?.(event);
  };

  return (
    <RNPressable
      disabled={disabled}
      hitSlop={{ top: 16, right: 16, bottom: 16, left: 16 }}
      onPress={disabled ? undefined : handlePress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      style={style}
    >
      {children}
    </RNPressable>
  );
};

export default Pressable;
