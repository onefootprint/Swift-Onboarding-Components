import { ComponentMeta, Story } from '@storybook/react';
import Icos from 'icons';
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
      options: Object.keys(Icos),
      name: 'Icon *',
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as ComponentMeta<typeof IconButton>;

const Template: Story<IconButtonProps> = ({
  Icon,
  ariaLabel,
  onClick,
  testID,
}: IconButtonProps) => {
  const SelectedIcon = typeof Icon === 'string' ? Icos[Icon] : Icon;
  return (
    <IconButton
      ariaLabel={ariaLabel}
      Icon={SelectedIcon}
      onClick={onClick}
      testID={testID}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  ariaLabel: 'Close',
  Icon: IcoClose24,
  onClick: console.log,
  testID: 'icon-button-test-id',
};
