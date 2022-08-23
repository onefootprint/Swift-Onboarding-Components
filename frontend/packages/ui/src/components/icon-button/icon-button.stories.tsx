import { ComponentMeta, Story } from '@storybook/react';
import { IcoClose24 } from 'icons';
import React from 'react';

import IconButton, { IconButtonProps } from './icon-button';

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
    iconComponent: {
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
  },
} as ComponentMeta<typeof IconButton>;

const Template: Story<IconButtonProps> = ({
  'aria-label': ariaLabel,
  disabled,
  onClick,
  testID,
}: IconButtonProps) => (
  <IconButton
    aria-label={ariaLabel}
    disabled={disabled}
    iconComponent={IcoClose24}
    onClick={onClick}
    testID={testID}
  />
);

export const Base = Template.bind({});
Base.args = {
  'aria-label': 'Close',
  iconComponent: IcoClose24,
  onClick: console.log,
  testID: 'icon-button-test-id',
};
