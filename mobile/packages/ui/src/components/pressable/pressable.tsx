import React from 'react';
import {
  GestureResponderEvent,
  Platform,
  Pressable as RNPressable,
  ViewStyle,
} from 'react-native';

export type PressableProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  onPressIn?: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
};

const Pressable = ({
  children,
  disabled = false,
  onPress,
  onPressIn,
  onPressOut,
  style = {},
}: PressableProps) => {
  return (
    <RNPressable
      disabled={disabled}
      hitSlop={Platform.select({
        ios: undefined,
        default: { top: 16, right: 16, bottom: 16, left: 16 },
      })}
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      style={style}
    >
      {children}
    </RNPressable>
  );
};

export default Pressable;
