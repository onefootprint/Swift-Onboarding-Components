import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react-native';
import { Box, Typography } from '@onefootprint/ui';

const BoxMeta: ComponentMeta<typeof Box> = {
  title: 'Box',
  component: Box,
  argTypes: {
    children: {
      control: 'text',
    },
  },
  args: {
    children: 'Hello world',
    backgroundColor: 'error',
    borderRadius: 'default',
    padding: 5,
  },
};

export default BoxMeta;

type BoxStory = ComponentStory<typeof Box>;

export const Basic: BoxStory = args => {
  return (
    <Box {...args}>
      <Typography variant="body-1">Box</Typography>
    </Box>
  );
};
