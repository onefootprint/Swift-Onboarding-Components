import styled, { css } from '@onefootprint/styled';
import React from 'react';
import { Dimensions } from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

type FrameProps = {
  detector: any;
};

const Frame = ({ detector }: FrameProps) => {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      borderWidth: withTiming(detector.value ? 6 : 3, { duration: 200 }),
    };
  });

  return <StyledFrame style={animatedStyles} />;
};

const dimensions = Dimensions.get('window');
const frameHeight = 220;
const frameWidth = dimensions.width - 32;

const StyledFrame = styled(Reanimated.View)`
  ${({ theme }) => css`
    border-color: #FFF;
    border-radius: ${theme.borderRadius.large};
    border: ${theme.borderWidth[2]} solid #FFF  
    height: ${frameHeight}px};
    position: absolute;
    top: ${dimensions.height / 2 - frameHeight / 2}px;
    width: ${frameWidth}px;
    z-index: 1;
  `}
`;

export default Frame;
