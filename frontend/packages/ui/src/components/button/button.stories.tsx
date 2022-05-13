import { Meta, Story } from '@storybook/react';
import React from 'react';

import Button, { ButtonProps } from './button';

export default {
  component: Button,
  title: 'Components/Button',
  argTypes: {
    children: { control: 'text' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    size: { control: 'select', options: ['default', 'compact', 'large'] },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    type: { control: 'select', options: ['button', 'submit'] },
    variant: { control: 'select', options: ['primary', 'secondary'] },
  },
} as Meta;

const Template: Story<ButtonProps> = ({
  children,
  disabled,
  fullWidth,
  onPress,
  size,
  testID,
  type,
  variant,
}: ButtonProps) => (
  <Button
    disabled={disabled}
    fullWidth={fullWidth}
    onPress={onPress}
    size={size}
    testID={testID}
    type={type}
    variant={variant}
  >
    {children}
  </Button>
);

export const Base = Template.bind({});
Base.args = {
  children: 'Button',
  disabled: false,
  fullWidth: false,
  onPress: () => alert('I was pressed'),
  size: 'default',
  testID: 'button-test-id',
  type: 'button',
  variant: 'primary',
};

export const PrimaryDefault = Template.bind({});
PrimaryDefault.args = {
  children: 'Primary button',
  variant: 'primary',
};

export const PrimaryCompact = Template.bind({});
PrimaryCompact.args = {
  children: 'Primary button compact',
  size: 'compact',
};

export const SecondaryDefault = Template.bind({});
SecondaryDefault.args = {
  children: 'Secondary button',
  variant: 'secondary',
};

export const SecondaryCompact = Template.bind({});
SecondaryCompact.args = {
  children: 'Secondary button compact',
  variant: 'secondary',
  size: 'compact',
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  children: 'Lorem',
  fullWidth: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  children: 'Disabled',
  disabled: true,
};
