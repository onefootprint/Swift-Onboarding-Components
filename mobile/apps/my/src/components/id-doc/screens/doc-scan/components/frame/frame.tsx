import React from 'react';
import { Dimensions } from 'react-native';
import { RNHoleView } from 'react-native-hole-view';
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import styled, { css } from 'styled-components/native';
import { useTimeout } from 'usehooks-ts';

type FrameProps = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  detector: any;
  aspectRatio: number;
  children?: React.ReactNode;
};

const INSTRUCTIONS_TIMEOUT = 3000;
const dimensions = Dimensions.get('window');
const horizontalPadding = 32;

const Frame = ({ children, detector, aspectRatio = 1.586 }: FrameProps) => {
  const frameWidth = dimensions.width - horizontalPadding;
  const frameHeight = Math.floor(frameWidth / aspectRatio);
  const opacity = useSharedValue(1);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      borderWidth: withTiming(detector.value ? 6 : 3, { duration: 200 }),
    };
  });
  useTimeout(() => {
    opacity.value = withTiming(0, { duration: 1000 });
  }, INSTRUCTIONS_TIMEOUT);

  return (
    <>
      <StyledFrame style={animatedStyles} frameWidth={frameWidth} frameHeight={frameHeight}>
        {children}
      </StyledFrame>
      <Hole
        holes={[
          {
            x: horizontalPadding / 2,
            y: dimensions.height / 2 - frameHeight / 2,
            width: frameWidth,
            height: frameHeight - 4,
            borderRadius: 16,
          },
        ]}
      />
    </>
  );
};

const StyledFrame = styled(Reanimated.View)<{
  frameWidth: number;
  frameHeight: number;
}>`
  ${({ theme, frameWidth, frameHeight }) => {
    return css`
      align-items: center;
      border-color: #fff;
      border-radius: ${theme.borderRadius.large};
      border: ${theme.borderWidth[2]} solid #fff;
      gap: ${theme.spacing[2]};
      height: ${frameHeight}px;
      justify-content: center;
      left: ${dimensions.width / 2 - frameWidth / 2}px;
      position: absolute;
      text-align: center;
      top: ${dimensions.height / 2 - frameHeight / 2}px;
      width: ${frameWidth}px;
      z-index: 1;
      overflow: hidden;
    `;
  }}
`;

const Hole = styled(RNHoleView)`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.6);
  width: 100%;
  height: 100%;
`;

export default Frame;
