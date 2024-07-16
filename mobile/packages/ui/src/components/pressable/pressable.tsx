import React from 'react';
import type { GestureResponderEvent, ViewStyle } from 'react-native';
import { Pressable as RNPressable } from 'react-native';

export type PressableProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  onPressIn?: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
};

const Pressable = ({ children, disabled = false, onPress, onPressIn, onPressOut, style = {} }: PressableProps) => {
  const handlePress = (event: GestureResponderEvent) => {
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
