import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react-native';
import { LinkButton } from '@onefootprint/ui';

const LinkButtonMeta: ComponentMeta<typeof LinkButton> = {
  title: 'LinkButton',
  component: LinkButton,
  argTypes: {
    onPress: { action: 'pressed the LinkButton' },
    'aria-label': {
      control: 'text',
    },
    children: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
    },
    disabled: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['default', 'compact', 'tiny', 'xTiny', 'xxTiny'],
    },
  },
  args: {
    'aria-label': '',
    children: 'LinkButton',
    disabled: false,
    size: 'default',
    variant: 'default',
  },
};

export default LinkButtonMeta;

type LinkButtonStory = ComponentStory<typeof LinkButton>;

export const Basic: LinkButtonStory = args => <LinkButton {...args} />;
