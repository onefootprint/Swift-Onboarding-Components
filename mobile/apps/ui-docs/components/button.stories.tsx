import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react-native';
import { Button } from '@onefootprint/ui';

const ButtonMeta: ComponentMeta<typeof Button> = {
  title: 'Button',
  component: Button,
  argTypes: {
    onPress: { action: 'pressed the button' },
    children: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    disabled: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['default', 'compact', 'small', 'large'],
    },
    loading: {
      control: 'boolean',
    },
    loadingAriaLabel: {
      control: 'text',
    },
  },
  args: {
    children: 'Hello world',
    disabled: false,
    size: 'default',
    variant: 'secondary',
  },
};

export default ButtonMeta;

type ButtonStory = ComponentStory<typeof Button>;

export const Basic: ButtonStory = args => <Button {...args} />;
