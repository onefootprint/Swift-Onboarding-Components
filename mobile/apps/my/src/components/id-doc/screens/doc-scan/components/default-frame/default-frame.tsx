import styled, { css } from '@onefootprint/styled';
import React from 'react';
import { Dimensions } from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

type FrameProps = {
  detector: any;
  aspectRatio: number;
};

const Frame = ({ detector, aspectRatio = 1.586 }: FrameProps) => {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      borderWidth: withTiming(detector.value ? 6 : 3, { duration: 200 }),
    };
  });

  return <StyledFrame aspectRatio={aspectRatio} style={animatedStyles} />;
};

const StyledFrame = styled(Reanimated.View)`
  ${({ theme, aspectRatio }) => {
    const dimensions = Dimensions.get('window');
    const horizontalPadding = 32;
    const frameWidth = dimensions.width - horizontalPadding;
    const frameHeight = Math.floor(frameWidth / aspectRatio);

    return css`
      border-color: #FFF;
      border-radius: ${theme.borderRadius.large};
      border: ${theme.borderWidth[2]} solid #FFF  
      height: ${frameHeight}px;
      left: ${dimensions.width / 2 - frameWidth / 2}px;
      position: absolute;
      top: ${dimensions.height / 2 - frameHeight / 2}px;
      width: ${frameWidth}px;
      z-index: 1;
    `;
  }}
`;

export default Frame;
