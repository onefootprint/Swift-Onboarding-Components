import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';

const Flash = () => {
  const animation = useMemo(() => {
    return new Animated.Value(1);
  }, []);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [animation]);

  const flashStyle = {
    opacity: animation,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  };

  return <Animated.View style={[styles.overlay, flashStyle]} />;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export default Flash;
