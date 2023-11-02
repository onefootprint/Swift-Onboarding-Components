import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { Dimensions } from 'react-native';
import { RNHoleView } from 'react-native-hole-view';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTimeout } from 'usehooks-ts';

type FrameProps = {
  title: string;
  description: string;
  detector: any;
  aspectRatio: number;
  children?: React.ReactNode;
};

const INSTRUCTIONS_TIMEOUT = 3000;
const dimensions = Dimensions.get('window');
const horizontalPadding = 32;

const Frame = ({
  children,
  title,
  description,
  detector,
  aspectRatio = 1.586,
}: FrameProps) => {
  const frameWidth = dimensions.width - horizontalPadding;
  const frameHeight = Math.floor(frameWidth / aspectRatio);
  const opacity = useSharedValue(1);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      borderWidth: withTiming(detector.value ? 6 : 3, { duration: 200 }),
    };
  });
  const animatedOpacityStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  useTimeout(() => {
    opacity.value = withTiming(0, { duration: 1000 });
  }, INSTRUCTIONS_TIMEOUT);

  return (
    <>
      <StyledFrame
        style={animatedStyles}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
      >
        {children || (
          <Instructions style={animatedOpacityStyles}>
            <Typography variant="label-3" color="primary">
              {title}
            </Typography>
            <Typography variant="body-3" color="primary">
              {description}
            </Typography>
          </Instructions>
        )}
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
      border-color: #FFF;
      border-radius: ${theme.borderRadius.large};
      border: ${theme.borderWidth[2]} solid #FFF  
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

const Instructions = styled(Reanimated.View)`
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const Hole = styled(RNHoleView)`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
`;

export default Frame;
