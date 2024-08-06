import type { Meta, Story } from '@storybook/react';

import type { GoogleButtonProps } from './google-button';
import GoogleButton from './google-button';

export default {
  component: GoogleButton,
  title: 'Components/GoogleButton',
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to be rendered',
      required: false,
      table: { defaultValue: { summary: 'Continue with Google' } },
    },
    loading: {
      control: 'boolean',
      description: 'Shows a loading spinner',
      required: false,
    },
    loadingAriaLabel: {
      control: 'text',
      description: 'Aria label when showing the loading spinner',
      required: false,
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
      required: false,
    },
    fullWidth: {
      control: 'boolean',
      description: 'Renders the button as a block element (100%)',
      required: false,
    },
    size: {
      control: 'select',
      options: ['default', 'compact', 'large'],
      description: 'Button size',
      required: false,
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
      required: false,
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Append an attribute type',
      required: false,
    },
  },
} as Meta;

const Template: Story<GoogleButtonProps> = ({
  children,
  disabled,
  fullWidth,
  onClick,
  size,
  testID,
  loading,
  loadingAriaLabel,
  type,
}: GoogleButtonProps) => (
  <GoogleButton
    loading={loading}
    loadingAriaLabel={loadingAriaLabel}
    disabled={disabled}
    fullWidth={fullWidth}
    onClick={onClick}
    size={size}
    testID={testID}
    type={type}
  >
    {children}
  </GoogleButton>
);

export const Base = Template.bind({});
Base.args = {
  children: 'Continue with Google',
  disabled: false,
  fullWidth: false,
  loading: false,
  loadingAriaLabel: 'Loading',
  onClick: () => alert('I was clicked'), // eslint-disable-line no-alert
  size: 'default',
  testID: 'google-button-test-id',
  type: 'button',
};
