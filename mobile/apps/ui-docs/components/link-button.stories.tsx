import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react-native';
import { LinkButton } from '@onefootprint/ui';
import { IcoUser16, icos } from '@onefootprint/icons';

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
    iconComponent: {
      control: 'select',
      options: Object.keys(icos),
    },
    iconPosition: {
      control: 'select',
      description: 'Where the Icon should be placed',
      options: ['left', 'right'],
      table: { defaultValue: { summary: 'right' } },
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
    iconComponent: IcoUser16,
  },
};

type LinkButtonStory = ComponentStory<typeof LinkButton>;

export const Basic: LinkButtonStory = ({ iconComponent: Icon, ...props }) => {
  const SelectedIcon = typeof Icon === 'string' ? icos[Icon] : Icon;
  return <LinkButton {...props} iconComponent={SelectedIcon} />;
};

export default LinkButtonMeta;
