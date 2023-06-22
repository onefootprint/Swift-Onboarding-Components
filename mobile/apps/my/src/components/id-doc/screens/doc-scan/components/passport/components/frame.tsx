import styled from '@onefootprint/styled';
import React from 'react';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

const Frame = ({ detector }) => {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      borderWidth: detector.value ? 6 : 4,
    };
  });

  return <StyledFrame style={animatedStyles} />;
};

const StyledFrame = styled(Reanimated.View)`
  ${({ theme }) => `
    border-radius: ${theme.borderRadius.large};
    border-color: ${theme.borderColor.primary};
    height: 220px;
    position: absolute;
    width: 190px;
    z-index: 1;
  `}
`;

export default Frame;
