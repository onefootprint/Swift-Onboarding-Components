import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react-native';
import { Box, DismissKeyboard, Typography } from '@onefootprint/ui';
import { TextInput } from 'react-native';
import styled from '@onefootprint/styled';

const DismissKeyboardMeta: ComponentMeta<typeof DismissKeyboard> = {
  title: 'DismissKeyboard',
  component: DismissKeyboard,
  argTypes: {},
  args: {},
};

export default DismissKeyboardMeta;

type DismissKeyboardStory = ComponentStory<typeof DismissKeyboard>;

export const Basic: DismissKeyboardStory = args => {
  const [value, setValue] = useState('');

  return (
    <DismissKeyboard>
      <Typography variant="body-1">DismissKeyboard</Typography>
      <StyledTextInput
        onChangeText={setValue}
        placeholder="Type something and click outside the input"
        value={value}
      />
    </DismissKeyboard>
  );
};

const StyledTextInput = styled(TextInput)`
  border: 1px solid #dcdcdc;
  height: 40px;
  padding: 4px;
  border-radius: 6px;
`;
