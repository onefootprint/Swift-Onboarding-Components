import type { Meta, Story } from '@storybook/react';
import React from 'react';

import Stack from '../stack';
import type { SplitButtonProps } from './split-button';
import SplitButton from './split-button';

export default {
  component: SplitButton,
  title: 'Components/SplitButton',
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    loading: {
      control: 'boolean',
      description: 'Shows a loading spinner',
    },
    loadingAriaLabel: {
      control: 'text',
      description: 'Aria label when showing the loading spinner',
    },
    onClick: {
      action: 'onClick',
      description: 'Callback when the button is clicked',
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
    options: {
      control: 'object',
      description: 'Options to be rendered',
    },
    size: {
      control: 'select',
      options: ['compact', 'default', 'large'],
      description: 'Sets the size of the button',
    },
  },
} as Meta;

const Template: Story<SplitButtonProps> = ({ disabled, loading, type, variant, options, size }: SplitButtonProps) => (
  <Stack align="center" justify="center" height="100vh" width="100vw">
    <SplitButton disabled={disabled} loading={loading} type={type} variant={variant} options={options} size={size} />
  </Stack>
);

export const Primary = Template.bind({});
Primary.args = {
  disabled: false,
  loading: false,
  type: 'button',
  variant: 'primary',
  options: [
    {
      label: 'Option 1',
      value: 'option-1',
      onSelect: () => {
        console.log('option 1');
      },
    },
    {
      label: 'Option 2',
      value: 'option-2',
      onSelect: () => {
        console.log('option 2');
      },
    },
  ],
  size: 'default',
};

export const Secondary = Template.bind({});
Secondary.args = {
  disabled: false,
  loading: false,
  type: 'button',
  variant: 'secondary',
  options: [
    {
      label: 'Option 1',
      value: 'option-1',
      onSelect: () => {
        console.log('option 1');
      },
    },
    {
      label: 'Option 2',
      value: 'option-2',
      onSelect: () => {
        console.log('option 2');
      },
    },
  ],
  size: 'default',
};
