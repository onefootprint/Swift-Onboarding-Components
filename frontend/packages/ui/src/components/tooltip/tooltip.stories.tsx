import { Meta, Story } from '@storybook/react';
import React from 'react';

import Button from '../button';
import Tooltip, { TooltipProps } from './tooltip';

export default {
  component: Tooltip,
  title: 'Components/Tooltip',
  argTypes: {
    text: {
      control: 'string',
      table: {
        type: { summary: 'string', required: true },
      },
      description: 'The text of the tooltip',
    },
    children: {
      control: 'string',
      table: {
        type: { summary: 'string', required: true },
      },
      description: 'The tooltip trigger',
    },
    'aria-label': {
      control: 'string',
      table: {
        type: { summary: 'string', required: false },
      },
      description:
        'The accessible, human friendly label to use for screen readers.',
    },
    testID: {
      control: 'text',
      table: {
        type: { summary: 'string', required: false },
      },
      description: 'Append an attribute data-testid for testing purposes',
    },
    size: {
      control: 'select',
      defaultValue: 'default',
      description: 'The size of the tooltip',
      options: ['default', 'compact'],
      table: {
        type: { summary: 'string', required: false },
        defaultValue: { summary: 'default' },
      },
    },
    placement: {
      control: 'select',
      defaultValue: 'bottom',
      description:
        'Where the tooltip should be placed, according to its children',
      options: [
        'auto',
        'auto-start',
        'auto-end',
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'right',
        'right-start',
        'right-end',
        'left',
        'left-start',
        'left-end',
      ],
      table: {
        type: { summary: 'string', required: false },
        defaultValue: { summary: 'bottom' },
      },
    },
  },
} as Meta;

const Template: Story<TooltipProps> = ({
  'aria-label': ariaLabel,
  placement,
  size,
  testID,
  text,
}: TooltipProps) => (
  <Tooltip
    aria-label={ariaLabel}
    placement={placement}
    size={size}
    testID={testID}
    text={text}
  >
    <Button>Hover me</Button>
  </Tooltip>
);

export const Base = Template.bind({});
Base.args = {
  'aria-label': 'Aria label',
  placement: 'bottom',
  size: 'default',
  testID: 'tooltip-test-id',
  text: 'Some text',
};
