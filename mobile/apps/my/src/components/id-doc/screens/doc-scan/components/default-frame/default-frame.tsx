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

const windowWidth = Dimensions.get('window').width;

const StyledFrame = styled(Reanimated.View)`
  ${({ theme }) => css`
    border-color: #FFF;
    border-radius: ${theme.borderRadius.large};
    border: ${theme.borderWidth[2]} solid #FFF  
    height: 220px;
    position: absolute;
    width: ${windowWidth - 32}px;
    z-index: 1;
    top: 50px;
  `}
`;

export default Frame;
