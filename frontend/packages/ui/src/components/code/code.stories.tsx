import { Meta, Story } from '@storybook/react';
import React from 'react';

import Code, { CodeProps } from './code';

export default {
  component: Code,
  title: 'Components/Code',
  argTypes: {
    buttonAriaLabel: {
      control: 'text',
      description: 'Copy to clipboard',
      required: true,
    },
    children: {
      control: 'text',
      description: 'Content to be rendered',
      required: true,
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    tooltipText: {
      control: {
        type: 'text',
      },
      type: { name: 'string', required: false },
      description: 'Tooltip text',
      table: { defaultValue: { summary: 'Copy to clipboard' } },
    },
    tooltipTextConfirmation: {
      control: {
        type: 'text',
      },
      type: { name: 'string', required: false },
      description: 'Toast title description',
      table: { defaultValue: { summary: 'Copied to clipboard' } },
    },
  },
} as Meta;

const Template: Story<CodeProps> = ({
  buttonAriaLabel,
  children,
  testID,
  tooltipText,
  tooltipTextConfirmation,
}: CodeProps) => (
  <Code
    buttonAriaLabel={buttonAriaLabel}
    testID={testID}
    tooltipText={tooltipText}
    tooltipTextConfirmation={tooltipTextConfirmation}
  >
    {children}
  </Code>
);

export const Base = Template.bind({});
Base.args = {
  buttonAriaLabel: 'Copy',
  children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
  testID: 'code-test-id',
  tooltipText: 'Copy to clipboard',
  tooltipTextConfirmation: 'Copied!',
};
