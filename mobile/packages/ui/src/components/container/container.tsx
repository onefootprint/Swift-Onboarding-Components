import styled, { css } from '@onefootprint/styled';
import React from 'react';
import { NativeScrollEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ContainerProps = {
  center?: boolean;
  children?: React.ReactNode;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  onScroll?: (event: NativeScrollEvent, isEnd: boolean) => void;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
};

const Container = ({
  center = false,
  children,
  keyboardShouldPersistTaps,
  scroll,
  onScroll,
  style,
}: ContainerProps) => {
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      const { contentOffset, layoutMeasurement, contentSize } = event;
      const hasEndReached =
        contentOffset.y >= contentSize.height - layoutMeasurement.height;
      if (onScroll) {
        runOnJS(onScroll)(event, hasEndReached);
      }
    },
  });

  return !scroll ? (
    <ViewContainer>
      <View center={center} style={style}>
        {children}
      </View>
    </ViewContainer>
  ) : (
    <AnimatedScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      onScroll={onScroll ? scrollHandler : undefined}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView style={style}>{children}</SafeAreaView>
    </AnimatedScrollView>
  );
};

const ViewContainer = styled.SafeAreaView`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    height: 100%;
    width: 100%;
  `}
`;

const View = styled.View<{ center: boolean }>`
  ${({ theme }) => css`
    flex: 1;
    padding-horizontal: ${theme.spacing[5]};
    padding-vertical: ${theme.spacing[7]};
  `}
  ${({ center }) =>
    center &&
    css`
      align-items: center;
      justify-content: center;
    `}
`;

const AnimatedScrollView = styled(Animated.ScrollView)<{
  center: boolean;
}>`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    padding-horizontal: ${theme.spacing[5]};
    height: 100%;
    width: 100%;
  `}
  ${({ center }) =>
    center &&
    css`
      align-items: center;
      justify-content: center;
    `}
`;

export default Container;
