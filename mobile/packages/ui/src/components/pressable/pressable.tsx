import React from 'react';
import {
  GestureResponderEvent,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

export type PressableProps = {
  children: React.ReactNode;
  disabled?: boolean;
  hitSlop?: number;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
};

const Pressable = ({
  children,
  disabled = false,
  hitSlop = 0,
  onPress,
  style = {},
}: PressableProps) => {
  return (
    <TouchableOpacity
      hitSlop={{
        top: hitSlop,
        bottom: hitSlop,
        left: hitSlop,
        right: hitSlop,
      }}
      activeOpacity={0.75}
      style={style}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

export default Pressable;
