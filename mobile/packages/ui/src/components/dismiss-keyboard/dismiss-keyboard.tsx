import React from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

import Box from '../box';

export type DismissKeyboardProps = {
  accessible?: boolean;
  children: React.ReactNode;
};

const DismissKeyboard = ({ accessible = false, children }: DismissKeyboardProps) => (
  <TouchableWithoutFeedback accessible={accessible} onPress={Keyboard.dismiss}>
    <Box>{children}</Box>
  </TouchableWithoutFeedback>
);

export default DismissKeyboard;
