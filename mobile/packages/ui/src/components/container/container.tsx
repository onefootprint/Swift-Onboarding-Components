import React from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { css } from 'styled-components/native';

export type ContainerProps = {
  center?: boolean;
  children?: React.ReactNode;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const Container = ({
  center = false,
  children,
  keyboardShouldPersistTaps,
  scroll,
  style,
  onLayout,
}: ContainerProps) => {
  return !scroll ? (
    <ViewContainer>
      <View center={center} style={style}>
        {children}
      </View>
    </ViewContainer>
  ) : (
    <AnimatedScrollView
      center={center}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      onLayout={onLayout}
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

const AnimatedScrollView = styled.ScrollView<{
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
