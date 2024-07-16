import React from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import { useTheme } from 'styled-components';

export type StatusBarProps = {
  variant: 'default' | 'on-dialog' | 'on-camera';
};

const StatusBar = ({ variant }: StatusBarProps) => {
  const theme = useTheme();

  if (variant === 'on-dialog') {
    return <RNStatusBar barStyle="dark-content" backgroundColor="rgba(0, 0, 0, 0.3)" />;
  }
  if (variant === 'on-camera') {
    return <RNStatusBar barStyle="light-content" backgroundColor="#000" />;
  }
  return <RNStatusBar barStyle="dark-content" backgroundColor={theme.backgroundColor.secondary} />;
};

export default StatusBar;
