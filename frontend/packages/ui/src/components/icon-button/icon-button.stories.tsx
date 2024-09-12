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
      name: 'ariaLabel *',
      required: true,
    },
    onClick: {
      description: 'Callback function triggered upon click',
      required: false,
    },
    children: {
      control: 'select',
      description: 'Icon to be rendered',
      name: 'Icon *',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    variant: {
      control: 'select',
      options: ['ghost', 'primary', 'secondary'],
      description: 'Button variant',
    },
  },
} satisfies Meta<typeof IconButton>;

const Template: StoryFn<IconButtonProps> = ({
  'aria-label': ariaLabel,
  disabled,
  onClick,
  testID,
  variant,
}: IconButtonProps) => (
  <IconButton aria-label={ariaLabel} disabled={disabled} onClick={onClick} testID={testID} variant={variant}>
    <IcoClose24 color="tertiary" />
  </IconButton>
);

export const Ghost = Template.bind({});
Ghost.args = {
  'aria-label': 'Close',
  children: <IcoClose24 />,
  onClick: console.log, // eslint-disable-line no-console
  testID: 'icon-button-test-id',
  variant: 'ghost',
};

export const Primary = Template.bind({});
Primary.args = {
  'aria-label': 'Close',
  children: <IcoClose24 />,
  onClick: console.log, // eslint-disable-line no-console
  testID: 'icon-button-test-id',
  variant: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  'aria-label': 'Close',
  children: <IcoClose24 />,
  onClick: console.log, // eslint-disable-line no-console
  testID: 'icon-button-test-id',
  variant: 'secondary',
};
