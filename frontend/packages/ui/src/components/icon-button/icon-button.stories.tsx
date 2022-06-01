import { ComponentMeta, Story } from '@storybook/react';
import { icos } from 'icons';
import IcoClose24 from 'icons/ico/ico-close-24';
import React from 'react';

import IconButton, { IconButtonProps } from './icon-button';

export default {
  component: IconButton,
  title: 'Components/IconButton',
  argTypes: {
    ariaLabel: {
      control: 'text',
      description: 'Aria Label for accessibility',
      name: 'ariaLabel *',
      required: true,
    },
    onClick: {
      description: 'Callback function triggered upon click',
      required: false,
    },
    Icon: {
      control: 'select',
      description: 'Icon to be rendered',
      options: Object.keys(icos),
      name: 'Icon *',
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as ComponentMeta<typeof IconButton>;

const Template: Story<IconButtonProps> = ({
  iconComponent: Icon,
  ariaLabel,
  onClick,
  testID,
}: IconButtonProps) => {
  const SelectedIcon = typeof Icon === 'string' ? icos[Icon] : Icon;
  return (
    <IconButton
      ariaLabel={ariaLabel}
      iconComponent={SelectedIcon}
      onClick={onClick}
      testID={testID}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  ariaLabel: 'Close',
  iconComponent: IcoClose24,
  onClick: console.log,
  testID: 'icon-button-test-id',
};
