import { Meta, Story } from '@storybook/react';
import React from 'react';

import CodeInline, { CodeInlineProps } from './code-inline';

export default {
  component: CodeInline,
  title: 'Components/CodeInline',
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
    disable: {
      control: 'boolean',
      description: 'Disable copy',
      required: false,
    },
    truncate: {
      control: 'boolean',
      description: 'Prevent to break the line',
      required: false,
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

const Template: Story<CodeInlineProps> = ({
  buttonAriaLabel,
  children,
  disable,
  testID,
  tooltipText,
  tooltipTextConfirmation,
  truncate,
}: CodeInlineProps) => (
  <CodeInline
    buttonAriaLabel={buttonAriaLabel}
    disable={disable}
    testID={testID}
    tooltipText={tooltipText}
    tooltipTextConfirmation={tooltipTextConfirmation}
    truncate={truncate}
  >
    {children}
  </CodeInline>
);

export const Base = Template.bind({});
Base.args = {
  buttonAriaLabel: 'Copy',
  children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
  disable: false,
  testID: 'code-test-id',
  tooltipText: 'Copy to clipboard',
  tooltipTextConfirmation: 'Copied!',
  truncate: false,
};
