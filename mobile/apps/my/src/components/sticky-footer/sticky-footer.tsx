import styled, { css, useTheme } from '@onefootprint/styled';
import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StickyFooter = ({ children, isFixed }) => {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme();
  const borderTopWidthValue = useSharedValue(isFixed.value ? 0 : 1);
  const paddingTopValue = useSharedValue(isFixed.value ? 0 : 16);
  borderTopWidthValue.value = withSpring(isFixed.value ? 0 : 1);
  paddingTopValue.value = withSpring(isFixed.value ? 0 : 16);
  const style = useAnimatedStyle(() => {
    return {
      position: isFixed.value ? 'relative' : 'absolute',
      borderTopWidth: borderTopWidthValue.value,
      borderColor: isFixed.value ? 'transparent' : theme.borderColor.primary,
      backgroundColor: isFixed.value
        ? 'transparent'
        : theme.backgroundColor.primary,
      paddingTop: paddingTopValue.value,
      marginTop: 0,
    };
  }, [isFixed]);

  return (
    <Container bottom={bottom} style={style}>
      {children}
    </Container>
  );
};

const Container = styled(Animated.View)<{ bottom: number }>`
  ${({ theme, bottom }) => css`
    width: 100%;
    bottom: 0;
    padding-horizontal: ${theme.spacing[5]};
    padding-bottom: ${bottom}px;
  `}
`;

export default StickyFooter;
