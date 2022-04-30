import { Meta, Story } from '@storybook/react';
import React from 'react';

import FootprintButton, { FootprintButtonProps } from './footprint-button';

export default {
  component: FootprintButton,
  title: 'Components/FootprintButton',
  argTypes: {
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    size: { control: 'select', options: ['default', 'compact'] },
    testID: { control: 'text' },
    type: { control: 'select', options: ['button', 'submit'] },
    variant: { control: 'select', options: ['primary', 'secondary'] },
  },
} as Meta;

const Template: Story<FootprintButtonProps> = ({
  disabled,
  fullWidth,
  onPress,
  size,
  testID,
  type,
}: FootprintButtonProps) => (
  <FootprintButton
    disabled={disabled}
    fullWidth={fullWidth}
    onPress={onPress}
    size={size}
    testID={testID}
    type={type}
  />
);

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  fullWidth: false,
  onPress: () => alert('I was pressed'),
  size: 'default',
  testID: 'footprint-button-test-id',
  type: 'button',
};

export const Compact = Template.bind({});
Compact.args = {
  size: 'compact',
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  fullWidth: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};
