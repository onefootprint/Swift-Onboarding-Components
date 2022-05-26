import { Meta, Story } from '@storybook/react';
import React from 'react';

import Button, { ButtonProps } from './button';
import { buttonSizes } from './button.constants';

export default {
  component: Button,
  title: 'Components/Button',
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to be rendered',
    },
    loading: {
      control: 'boolean',
      description: 'Shows a loading spinner',
    },
    loadingAriaLabel: {
      control: 'text',
      description: 'Aria label when showing the loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Renders the button as a block element (100%)',
    },
    size: {
      control: 'select',
      options: buttonSizes,
      description: 'Button size',
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Append an attribute type',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Changes the style of the button',
    },
  },
} as Meta;

const Template: Story<ButtonProps> = ({
  children,
  disabled,
  fullWidth,
  onClick,
  size,
  testID,
  loading,
  loadingAriaLabel,
  type,
  variant,
}: ButtonProps) => (
  <Button
    loading={loading}
    loadingAriaLabel={loadingAriaLabel}
    disabled={disabled}
    fullWidth={fullWidth}
    onClick={onClick}
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
  loading: false,
  loadingAriaLabel: 'Loading',
  fullWidth: false,
  onClick: () => alert('I was clicked'),
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
