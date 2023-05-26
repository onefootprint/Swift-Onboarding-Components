import { IcoClose24 } from '@onefootprint/icons';
import { ComponentMeta, Story } from '@storybook/react';
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
    onClick={onClick}
    testID={testID}
  >
    <IcoClose24 color="tertiary" />
  </IconButton>
);

export const Base = Template.bind({});
Base.args = {
  'aria-label': 'Close',
  children: <IcoClose24 />,
  onClick: console.log, // eslint-disable-line no-console
  testID: 'icon-button-test-id',
};
