/* eslint-disable no-alert */
import type { Meta, StoryFn } from '@storybook/react';

import type { FootprintButtonProps } from './footprint-button';
import FootprintButton from './footprint-button';

export default {
  component: FootprintButton,
  title: 'Components/FootprintButton',
  argTypes: {
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    text: { control: 'text' },
    size: { control: 'select', options: ['default', 'compact'] },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    type: { control: 'select', options: ['button', 'submit'] },
    variant: { control: 'select', options: ['primary', 'secondary'] },
    loading: { control: 'boolean' },
  },
} as Meta;

const Template: StoryFn<FootprintButtonProps> = ({
  disabled,
  fullWidth,
  loading,
  onClick,
  size,
  testID,
  type,
  text,
}: FootprintButtonProps) => (
  <FootprintButton
    disabled={disabled}
    fullWidth={fullWidth}
    onClick={onClick}
    size={size}
    testID={testID}
    type={type}
    text={text}
    loading={loading}
  />
);

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  fullWidth: false,
  onClick: () => alert('I was pressed'),
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
