import { IcoFaceid24 } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';

import type { ButtonProps } from './button';
import Button from './button';

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
      description: 'Use 100% of the parent container width',
    },
    size: {
      control: 'select',
      options: ['default', 'compact', 'large'],
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
      options: ['primary', 'secondary', 'destructive'],
      description: 'Changes the style of the button',
    },
    iconColor: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'quaternary',
        'quinary',
        'senary',
        'info',
        'error',
        'warning',
        'success',
        'accent',
        'neutral',
      ],
      description: 'Changes the color of the icon',
    },
  },
} as Meta;

const Template: StoryFn<ButtonProps> = ({
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
  prefixIcon,
  iconColor,
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
    prefixIcon={prefixIcon}
    iconColor={iconColor}
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
  onClick: () => alert('I was clicked'), // eslint-disable-line no-alert
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

export const ButtonWithPrefixIcon = Template.bind({});
ButtonWithPrefixIcon.args = {
  children: 'With Icon',
  prefixIcon: IcoFaceid24,
};
