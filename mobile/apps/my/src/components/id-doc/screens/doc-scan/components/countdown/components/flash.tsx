import styled, { css } from '@onefootprint/styled';
import React, { useEffect, useMemo } from 'react';
import { Animated } from 'react-native';

const Flash = () => {
  const animation = useMemo(() => {
    return new Animated.Value(1);
  }, []);

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(animate); // This will loop the animation indefinitely
    };

    animate();
  }, [animation]);

  const flashStyle = {
    opacity: animation,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  };

  return <AnimatedView style={flashStyle} />;
};

const AnimatedView = styled(Animated.View)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.large};
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
  `}
`;

export default Flash;
