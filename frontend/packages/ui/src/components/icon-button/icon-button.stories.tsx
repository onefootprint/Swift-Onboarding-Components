import { IcoClose24 } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';
import type { IconButtonProps } from './icon-button';
import IconButton from './icon-button';

export default {
  component: IconButton,
  title: 'Components/IconButton',
  argTypes: {
    'aria-label': {
      control: 'text',
      description: 'Aria Label for accessibility',
      required: true,
    },
    children: {
      control: 'object',
      description: 'Icon component to be rendered',
      required: true,
    },
    variant: {
      control: 'select',
      options: ['ghost', 'primary', 'secondary'],
      description: 'Button variant',
      required: true,
    },
    onClick: {
      action: 'clicked',
      description: 'Callback function triggered upon click',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as Meta<IconButtonProps>;

const Template: StoryFn<IconButtonProps> = ({
  'aria-label': ariaLabel,
  children,
  variant,
  onClick,
  disabled,
  testID,
}: IconButtonProps) => (
  <IconButton aria-label={ariaLabel} variant={variant} onClick={onClick} disabled={disabled} testID={testID}>
    {children}
  </IconButton>
);

export const Ghost = Template.bind({});
Ghost.args = {
  'aria-label': 'Close',
  children: <IcoClose24 />,
  variant: 'ghost',
  onClick: () => console.log('clicked'), // eslint-disable-line no-console
  testID: 'icon-button-test-id',
};

export const Primary = Template.bind({});
Primary.args = {
  'aria-label': 'Close',
  children: <IcoClose24 />,
  variant: 'primary',
  onClick: () => console.log('clicked'), // eslint-disable-line no-console
  testID: 'icon-button-test-id',
};

export const Secondary = Template.bind({});
Secondary.args = {
  'aria-label': 'Close',
  children: <IcoClose24 />,
  variant: 'secondary',
  onClick: () => console.log('clicked'), // eslint-disable-line no-console
  testID: 'icon-button-test-id',
};

export const Disabled = Template.bind({});
Disabled.args = {
  'aria-label': 'Close',
  children: <IcoClose24 />,
  variant: 'primary',
  disabled: true,
  onClick: () => console.log('clicked'), // eslint-disable-line no-console
  testID: 'icon-button-test-id',
};
