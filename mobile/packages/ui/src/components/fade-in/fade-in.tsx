import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type FadeInProps = {
  duration?: number;
  children: React.ReactNode;
};

const FadeIn = ({ duration = 500, children }: FadeInProps) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration });
  }, []);

  const style = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return <Animated.View style={style}>{children}</Animated.View>;
};

export default FadeIn;
