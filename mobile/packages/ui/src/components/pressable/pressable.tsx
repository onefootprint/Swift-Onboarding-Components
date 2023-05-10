import React from 'react';
import {
  GestureResponderEvent,
  Platform,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

export type PressableProps = {
  activeOpacity?: number;
  children: React.ReactNode;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
};

const Pressable = ({
  activeOpacity = 0.75,
  children,
  disabled = false,
  onPress,
  style = {},
}: PressableProps) => {
  return (
    <TouchableOpacity
      hitSlop={Platform.select({
        ios: undefined,
        default: { top: 16, right: 16, bottom: 16, left: 16 },
      })}
      activeOpacity={activeOpacity}
      style={style}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

export default Pressable;
